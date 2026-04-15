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

INSERT INTO profissionais (id, nome, especialidade, disponibilidade) VALUES
('1', 'Dr. Ricardo Santos', 'Clínico Geral', '["Segunda-feira: 09:00-12:00", "Quarta-feira: 14:00-18:00"]'),
('2', 'Dra. Ana Oliveira', 'Nutricionista', '["Terça-feira: 10:00-13:00", "Quinta-feira: 15:00-19:00"]'),
('3', 'Dra. Beatriz Costa', 'Cardiologista', '["Segunda-feira: 14:00-18:00", "Sexta-feira: 09:00-12:00"]'),
('4', 'Dr. Carlos Mendes', 'Dermatologista', '["Terça-feira: 09:00-12:00", "Quinta-feira: 14:00-18:00"]'),
('5', 'Dra. Sofia Pereira', 'Pediatra', '["Quarta-feira: 09:00-13:00", "Sexta-feira: 14:00-17:00"]')
ON CONFLICT (id) DO NOTHING;
