import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { Pool } from "pg";

const app = express();
const PORT = 3000;

app.use(express.json());

// PostgreSQL setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:password@localhost:5432/clinica",
});

let useDb = false;

// Try to connect to PostgreSQL. If it fails, fallback to JSON files (for preview environment).
pool.connect()
  .then(async (client) => {
    useDb = true;
    console.log("Connected to PostgreSQL database.");
    
    // Initialize DB if not using docker-compose init.sql
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS profissionais (
          id VARCHAR(255) PRIMARY KEY,
          nome VARCHAR(255) NOT NULL,
          especialidade VARCHAR(255) NOT NULL,
          disponibilidade TEXT
        );
        CREATE TABLE IF NOT EXISTS agendamentos (
          id VARCHAR(255) PRIMARY KEY,
          nome VARCHAR(255) NOT NULL,
          cpf VARCHAR(255) NOT NULL,
          profissional_id VARCHAR(255) REFERENCES profissionais(id),
          profissional_nome VARCHAR(255) NOT NULL,
          especialidade VARCHAR(255) NOT NULL,
          data VARCHAR(255) NOT NULL,
          hora VARCHAR(255) NOT NULL,
          data_criacao VARCHAR(255) NOT NULL,
          status VARCHAR(50) NOT NULL
        );
      `);
      
      const res = await client.query('SELECT COUNT(*) FROM profissionais');
      if (parseInt(res.rows[0].count) === 0) {
        await client.query(`
          INSERT INTO profissionais (id, nome, especialidade, disponibilidade) VALUES
          ('1', 'Dr. Ricardo Santos', 'Clínico Geral', '["Segunda-feira: 09:00-12:00", "Quarta-feira: 14:00-18:00"]'),
          ('2', 'Dra. Ana Oliveira', 'Nutricionista', '["Terça-feira: 10:00-13:00", "Quinta-feira: 15:00-19:00"]'),
          ('3', 'Dra. Beatriz Costa', 'Cardiologista', '["Segunda-feira: 14:00-18:00", "Sexta-feira: 09:00-12:00"]'),
          ('4', 'Dr. Carlos Mendes', 'Dermatologista', '["Terça-feira: 09:00-12:00", "Quinta-feira: 14:00-18:00"]'),
          ('5', 'Dra. Sofia Pereira', 'Pediatra', '["Quarta-feira: 09:00-13:00", "Sexta-feira: 14:00-17:00"]')
        `);
      }
    } catch (err) {
      console.error("Error initializing DB tables:", err);
    } finally {
      client.release();
    }
  })
  .catch((err) => {
    console.log("PostgreSQL not available. Falling back to local JSON storage for preview environment.");
  });

// Mock data storage (Fallback)
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

const PROFESSIONALS_FILE = path.join(DATA_DIR, "professionals.json");
const AGENDAMENTOS_FILE = path.join(DATA_DIR, "agendamentos.json");

if (!fs.existsSync(PROFESSIONALS_FILE)) {
  fs.writeFileSync(
    PROFESSIONALS_FILE,
    JSON.stringify(
      [
        { id: "1", nome: "Dr. Ricardo Santos", especialidade: "Clínico Geral", disponibilidade: ["Segunda-feira: 09:00-12:00", "Quarta-feira: 14:00-18:00"] },
        { id: "2", nome: "Dra. Ana Oliveira", especialidade: "Nutricionista", disponibilidade: ["Terça-feira: 10:00-13:00", "Quinta-feira: 15:00-19:00"] },
        { id: "3", nome: "Dra. Beatriz Costa", especialidade: "Cardiologista", disponibilidade: ["Segunda-feira: 14:00-18:00", "Sexta-feira: 09:00-12:00"] },
        { id: "4", nome: "Dr. Carlos Mendes", especialidade: "Dermatologista", disponibilidade: ["Terça-feira: 09:00-12:00", "Quinta-feira: 14:00-18:00"] },
        { id: "5", nome: "Dra. Sofia Pereira", especialidade: "Pediatra", disponibilidade: ["Quarta-feira: 09:00-13:00", "Sexta-feira: 14:00-17:00"] },
      ],
      null,
      2
    )
  );
}

if (!fs.existsSync(AGENDAMENTOS_FILE)) {
  fs.writeFileSync(AGENDAMENTOS_FILE, JSON.stringify([], null, 2));
}

const loadProfessionals = () => JSON.parse(fs.readFileSync(PROFESSIONALS_FILE, "utf-8"));
const loadAgendamentos = () => JSON.parse(fs.readFileSync(AGENDAMENTOS_FILE, "utf-8"));
const saveAgendamentos = (data: any) => fs.writeFileSync(AGENDAMENTOS_FILE, JSON.stringify(data, null, 2));

// API Routes
app.get("/api/profissionais", async (req, res) => {
  const { especialidade, nome } = req.query;
  
  if (useDb) {
    try {
      let query = "SELECT * FROM profissionais";
      let values: any[] = [];
      let conditions = [];

      if (especialidade) {
        conditions.push(`LOWER(especialidade) = LOWER($${conditions.length + 1})`);
        values.push(especialidade);
      }
      if (nome) {
        conditions.push(`LOWER(nome) LIKE LOWER($${conditions.length + 1})`);
        values.push(`%${nome}%`);
      }

      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }

      const result = await pool.query(query, values);
      res.json({ total: result.rows.length, resultados: result.rows });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  } else {
    let profissionais = loadProfessionals();
    if (especialidade) {
      profissionais = profissionais.filter((p: any) => p.especialidade.toLowerCase() === (especialidade as string).toLowerCase());
    }
    if (nome) {
      profissionais = profissionais.filter((p: any) => p.nome.toLowerCase().includes((nome as string).toLowerCase()));
    }
    res.json({ total: profissionais.length, resultados: profissionais });
  }
});

app.get("/api/especialidades", async (req, res) => {
  if (useDb) {
    try {
      const result = await pool.query("SELECT DISTINCT especialidade FROM profissionais ORDER BY especialidade");
      const especialidades = result.rows.map(r => r.especialidade);
      res.json({ total: especialidades.length, especialidades });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  } else {
    const profissionais = loadProfessionals();
    const especialidades = Array.from(new Set(profissionais.map((p: any) => p.especialidade))).sort();
    res.json({ total: especialidades.length, especialidades });
  }
});

app.post("/api/agendar", async (req, res) => {
  const { nome, cpf, profissional_id, especialidade, data, hora } = req.body;

  const cpfLimpo = cpf.replace(/\D/g, "");
  if (cpfLimpo.length !== 11) {
    return res.status(400).json({ detail: "CPF inválido" });
  }

  const id = uuidv4();
  const data_criacao = new Date().toISOString();
  const status = "confirmado";

  if (useDb) {
    try {
      const profResult = await pool.query("SELECT nome FROM profissionais WHERE id = $1", [profissional_id]);
      if (profResult.rows.length === 0) {
        return res.status(404).json({ detail: "Profissional não encontrado" });
      }
      const profissional_nome = profResult.rows[0].nome;

      await pool.query(
        `INSERT INTO agendamentos 
        (id, nome, cpf, profissional_id, profissional_nome, especialidade, data, hora, data_criacao, status) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [id, nome, cpfLimpo, profissional_id, profissional_nome, especialidade, data, hora, data_criacao, status]
      );

      res.json({ 
        mensagem: "Agendamento realizado com sucesso!", 
        agendamento: { id, nome, cpf: cpfLimpo, profissional_id, profissional_nome, especialidade, data, hora, data_criacao, status } 
      });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  } else {
    const profissionais = loadProfessionals();
    const profissional = profissionais.find((p: any) => p.id === profissional_id);

    if (!profissional) {
      return res.status(404).json({ detail: "Profissional não encontrado" });
    }

    const novoAgendamento = {
      id, nome, cpf: cpfLimpo, profissional_id, profissional_nome: profissional.nome, especialidade, data, hora, data_criacao, status
    };

    const agendamentos = loadAgendamentos();
    agendamentos.push(novoAgendamento);
    saveAgendamentos(agendamentos);

    res.json({ mensagem: "Agendamento realizado com sucesso!", agendamento: novoAgendamento });
  }
});

app.post("/api/consultar", async (req, res) => {
  const { cpf } = req.body;
  const cpfLimpo = cpf.replace(/\D/g, "");

  if (cpfLimpo.length !== 11) {
    return res.status(400).json({ detail: "CPF inválido" });
  }

  if (useDb) {
    try {
      const result = await pool.query("SELECT * FROM agendamentos WHERE cpf = $1 ORDER BY data DESC, hora DESC", [cpfLimpo]);
      res.json({ total: result.rows.length, agendamentos: result.rows });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  } else {
    const agendamentos = loadAgendamentos();
    const agendamentosPaciente = agendamentos.filter((a: any) => a.cpf === cpfLimpo);
    res.json({ total: agendamentosPaciente.length, agendamentos: agendamentosPaciente });
  }
});

app.delete("/api/cancelar/:id", async (req, res) => {
  const { id } = req.params;

  if (useDb) {
    try {
      const result = await pool.query("DELETE FROM agendamentos WHERE id = $1 RETURNING *", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ detail: "Agendamento não encontrado" });
      }
      res.json({ mensagem: "Agendamento cancelado com sucesso", agendamento_cancelado: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  } else {
    let agendamentos = loadAgendamentos();
    const index = agendamentos.findIndex((a: any) => a.id === id);

    if (index === -1) {
      return res.status(404).json({ detail: "Agendamento não encontrado" });
    }

    const removido = agendamentos.splice(index, 1)[0];
    saveAgendamentos(agendamentos);

    res.json({ mensagem: "Agendamento cancelado com sucesso", agendamento_cancelado: removido });
  }
});

// Typebot API (Mock)
app.post("/api/chat", (req, res) => {
  const { message, context } = req.body;
  const msgLower = message.toLowerCase();
  
  let response = "Desculpe, não entendi. Pode reformular?";
  let nextContext = context || "start";

  if (nextContext === "start") {
    if (msgLower.includes("oi") || msgLower.includes("olá") || msgLower.includes("ola")) {
      response = "Olá! Bem-vindo à Clínica Médica Care. Como posso ajudar você hoje? (1) Agendar consulta, (2) Informações sobre especialidades, (3) Falar com atendente";
      nextContext = "menu";
    } else {
      response = "Olá! Digite 'oi' para começarmos.";
    }
  } else if (nextContext === "menu") {
    if (msgLower.includes("1") || msgLower.includes("agendar")) {
      response = "Ótimo! Para agendar uma consulta, por favor acesse a aba 'Agendamento' no menu principal. Lá você poderá escolher a especialidade e o profissional.";
      nextContext = "start";
    } else if (msgLower.includes("2") || msgLower.includes("especialidades")) {
      response = "Temos diversas especialidades, como: Clínico Geral, Nutricionista, Cardiologista, Dermatologista e Pediatra. Qual você procura?";
      nextContext = "especialidades";
    } else if (msgLower.includes("3") || msgLower.includes("atendente")) {
      response = "Vou transferir você para um de nossos atendentes. Por favor, aguarde um momento...";
      nextContext = "start";
    } else {
      response = "Por favor, escolha uma opção: (1) Agendar consulta, (2) Informações sobre especialidades, (3) Falar com atendente";
    }
  } else if (nextContext === "especialidades") {
    response = "Você pode agendar para qualquer uma dessas especialidades na aba 'Agendamento'. Posso ajudar com mais alguma coisa? (Sim/Não)";
    nextContext = "more_help";
  } else if (nextContext === "more_help") {
    if (msgLower.includes("sim")) {
      response = "Como posso ajudar? (1) Agendar consulta, (2) Informações sobre especialidades, (3) Falar com atendente";
      nextContext = "menu";
    } else {
      response = "Obrigado por entrar em contato com a Clínica Médica Care. Tenha um ótimo dia!";
      nextContext = "start";
    }
  }

  setTimeout(() => {
    res.json({ response, context: nextContext });
  }, 500); // Simulate typing delay
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
