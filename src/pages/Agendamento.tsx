import React, { useState, useEffect } from "react";

const API_URL = "http://161.97.183.125:3000";

export default function Agendamento() {
const [activeTab, setActiveTab] = useState<"agendar" | "consultar">("agendar");

// Agendar states
const [especialidades, setEspecialidades] = useState<string[]>([]);
const [profissionais, setProfissionais] = useState<any[]>([]);
const [selectedEspecialidade, setSelectedEspecialidade] = useState("");
const [formData, setFormData] = useState({
nome: "",
cpf: "",
profissional_id: "",
data: "",
hora: ""
});
const [agendarMsg, setAgendarMsg] = useState({ text: "", type: "" });

// Consultar states
const [consultaCpf, setConsultaCpf] = useState("");
const [consultaResultados, setConsultaResultados] = useState<any[] | null>(null);
const [consultaMsg, setConsultaMsg] = useState("");

useEffect(() => {
fetch(`${API_URL}/especialidades`)
.then(res => res.json())
.then(data => setEspecialidades(data.especialidades))
.catch(err => console.error(err));
}, []);

useEffect(() => {
if (selectedEspecialidade) {
fetch(`${API_URL}/profissionais?especialidade=${encodeURIComponent(selectedEspecialidade)}`)
.then(res => res.json())
.then(data => setProfissionais(data.resultados))
.catch(err => console.error(err));
} else {
setProfissionais([]);
}
}, [selectedEspecialidade]);

const handleAgendar = async (e: React.FormEvent) => {
e.preventDefault();

```
const [ano, mes, dia] = formData.data.split('-');
const dataFormatada = `${dia}/${mes}/${ano}`;

try {
  const res = await fetch(`${API_URL}/agendar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...formData,
      especialidade: selectedEspecialidade,
      data: dataFormatada
    })
  });
  
  const data = await res.json();
  
  if (res.ok) {
    setAgendarMsg({ text: `✓ Agendamento realizado com sucesso! ID: ${data.agendamento.id}`, type: "success" });
    setFormData({ nome: "", cpf: "", profissional_id: "", data: "", hora: "" });
    setSelectedEspecialidade("");
  } else {
    setAgendarMsg({ text: `Erro: ${data.detail || 'Não foi possível realizar o agendamento'}`, type: "error" });
  }
} catch (error) {
  setAgendarMsg({ text: "Erro ao conectar com o servidor", type: "error" });
}
```

};

const handleConsultar = async () => {
if (!consultaCpf) {
setConsultaMsg("Por favor, insira um CPF");
return;
}

```
try {
  const res = await fetch(`${API_URL}/consultar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cpf: consultaCpf })
  });
  
  const data = await res.json();
  
  if (res.ok && data.agendamentos && data.agendamentos.length > 0) {
    setConsultaResultados(data.agendamentos);
    setConsultaMsg("");
  } else {
    setConsultaResultados([]);
    setConsultaMsg("Nenhum agendamento encontrado para este CPF");
  }
} catch (error) {
  setConsultaMsg("Erro ao buscar agendamentos");
}
```

};

const handleCancelar = async (id: string) => {
if (!window.confirm("Tem certeza que deseja cancelar este agendamento?")) return;

```
try {
  const res = await fetch(`${API_URL}/cancelar/${id}`, { method: "DELETE" });
  if (res.ok) {
    alert("Agendamento cancelado com sucesso");
    handleConsultar();
  } else {
    alert("Erro ao cancelar agendamento");
  }
} catch (error) {
  alert("Erro ao conectar com o servidor");
}
```

};

return ( <div className="max-w-4xl mx-auto px-4 py-12"> <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8"> <h1 className="text-3xl font-bold text-center text-slate-800 mb-8">Sistema de Agendamento</h1>

```
    <div className="flex border-b border-slate-200 mb-8">
      <button 
        className={`px-6 py-3 font-semibold text-lg border-b-2 transition-colors ${activeTab === 'agendar' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        onClick={() => setActiveTab("agendar")}
      >
        Agendar Consulta
      </button>
      <button 
        className={`px-6 py-3 font-semibold text-lg border-b-2 transition-colors ${activeTab === 'consultar' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        onClick={() => setActiveTab("consultar")}
      >
        Consultar Agendamentos
      </button>
    </div>

    {activeTab === "agendar" && (
      <form onSubmit={handleAgendar} className="space-y-6">
        {/* restante do JSX permanece igual */}
      </form>
    )}

    {activeTab === "consultar" && (
      <div className="max-w-md">
        {/* restante do JSX permanece igual */}
      </div>
    )}
  </div>
</div>
```

);
}
