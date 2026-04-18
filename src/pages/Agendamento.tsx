import React, { useState, useEffect } from "react";

export default function Agendamento() {
  const [activeTab, setActiveTab] = useState<"agendar" | "consultar">("agendar");
  const apiBaseUrl = import.meta.env.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL).replace(/\/$/, "")
    : window.location.port === "5173"
      ? `${window.location.protocol}//${window.location.hostname}:3000`
      : "";
  
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
  const [especialidadesLoading, setEspecialidadesLoading] = useState(false);
  const [especialidadesError, setEspecialidadesError] = useState("");
  const [profissionaisLoading, setProfissionaisLoading] = useState(false);
  const [profissionaisError, setProfissionaisError] = useState("");

  // Consultar states
  const [consultaCpf, setConsultaCpf] = useState("");
  const [consultaResultados, setConsultaResultados] = useState<any[] | null>(null);
  const [consultaMsg, setConsultaMsg] = useState("");

  useEffect(() => {
    const carregarEspecialidades = async () => {
      try {
        setEspecialidadesLoading(true);
        setEspecialidadesError("");

        const res = await fetch(`${apiBaseUrl}/api/especialidades`);
        if (!res.ok) throw new Error("Falha ao buscar especialidades");

        const data = await res.json();
        setEspecialidades(Array.isArray(data.especialidades) ? data.especialidades : []);
      } catch (err) {
        console.error(err);
        setEspecialidades([]);
        setEspecialidadesError(
          "Não foi possível carregar as especialidades. Tente novamente em instantes."
        );
      } finally {
        setEspecialidadesLoading(false);
      }
    };

    carregarEspecialidades();
  }, [apiBaseUrl]);

  useEffect(() => {
    const carregarProfissionais = async () => {
      if (!selectedEspecialidade) {
        setProfissionais([]);
        setProfissionaisError("");
        return;
      }

      try {
        setProfissionaisLoading(true);
        setProfissionaisError("");
        const res = await fetch(
          `${apiBaseUrl}/api/profissionais?especialidade=${encodeURIComponent(selectedEspecialidade)}`
        );
        if (!res.ok) throw new Error("Falha ao buscar profissionais");

        const data = await res.json();
        setProfissionais(Array.isArray(data.resultados) ? data.resultados : []);
      } catch (err) {
        console.error(err);
        setProfissionais([]);
        setProfissionaisError(
          "Não foi possível carregar os profissionais desta especialidade."
        );
      } finally {
        setProfissionaisLoading(false);
      }
    };

    setFormData((previous) => ({ ...previous, profissional_id: "" }));
    if (!selectedEspecialidade) {
      setProfissionais([]);
      setProfissionaisLoading(false);
      setProfissionaisError("");
    }
    carregarProfissionais();
  }, [selectedEspecialidade, apiBaseUrl]);

  const handleAgendar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format date from YYYY-MM-DD to DD/MM/YYYY
    const [ano, mes, dia] = formData.data.split('-');
    const dataFormatada = `${dia}/${mes}/${ano}`;

    try {
      const res = await fetch(`${apiBaseUrl}/api/agendar`, {
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
  };

  const handleConsultar = async () => {
    if (!consultaCpf) {
      setConsultaMsg("Por favor, insira um CPF");
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/api/consultar`, {
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
  };

  const handleCancelar = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja cancelar este agendamento?")) return;

    try {
      const res = await fetch(`${apiBaseUrl}/api/cancelar/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Agendamento cancelado com sucesso");
        handleConsultar(); // Refresh list
      } else {
        alert("Erro ao cancelar agendamento");
      }
    } catch (error) {
      alert("Erro ao conectar com o servidor");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <h1 className="text-3xl font-bold text-center text-slate-800 mb-8">Sistema de Agendamento</h1>
        
        {/* Tabs */}
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

        {/* Tab Content: Agendar */}
        {activeTab === "agendar" && (
          <form onSubmit={handleAgendar} className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Preencha os dados para agendar</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nome Completo *</label>
                <input 
                  required
                  type="text" 
                  value={formData.nome}
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Seu nome completo" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">CPF *</label>
                <input 
                  required
                  type="text" 
                  value={formData.cpf}
                  onChange={e => setFormData({...formData, cpf: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="123.456.789-00" 
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Especialidade *</label>
                <select 
                  required
                  value={selectedEspecialidade}
                  onChange={e => setSelectedEspecialidade(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  disabled={especialidadesLoading}
                >
                  <option value="">
                    {especialidadesLoading ? "Carregando especialidades..." : "Selecione uma especialidade"}
                  </option>
                  {especialidades.map(esp => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
                {especialidadesError && (
                  <p className="mt-2 text-sm text-red-600">{especialidadesError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Profissional *</label>
                <select 
                  required
                  value={formData.profissional_id}
                  onChange={e => setFormData({...formData, profissional_id: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  disabled={!selectedEspecialidade || profissionaisLoading || !!profissionaisError}
                >
                  <option value="">
                    {!selectedEspecialidade
                      ? "Selecione uma especialidade primeiro"
                      : profissionaisLoading
                        ? "Carregando profissionais..."
                        : "Selecione um profissional"}
                  </option>
                  {profissionais.map(prof => (
                    <option key={prof.id} value={prof.id}>{prof.nome}</option>
                  ))}
                </select>
                {profissionaisError && (
                  <p className="mt-2 text-sm text-red-600">{profissionaisError}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Data *</label>
                <input 
                  required
                  type="date" 
                  value={formData.data}
                  onChange={e => setFormData({...formData, data: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Hora *</label>
                <input 
                  required
                  type="time" 
                  value={formData.hora}
                  onChange={e => setFormData({...formData, hora: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mt-4">
              Confirmar Agendamento
            </button>

            {agendarMsg.text && (
              <div className={`p-4 rounded-lg mt-4 ${agendarMsg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {agendarMsg.text}
              </div>
            )}
          </form>
        )}

        {/* Tab Content: Consultar */}
        {activeTab === "consultar" && (
          <div className="max-w-md">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Consulte seus agendamentos</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">CPF *</label>
              <input 
                type="text" 
                value={consultaCpf}
                onChange={e => setConsultaCpf(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" 
                placeholder="123.456.789-00" 
              />
              <button 
                onClick={handleConsultar}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Buscar Agendamentos
              </button>
            </div>

            {consultaMsg && (
              <div className="text-center p-4 text-slate-500 bg-slate-50 rounded-lg border border-slate-100">
                {consultaMsg}
              </div>
            )}

            {consultaResultados && consultaResultados.length > 0 && (
              <div className="space-y-4 mt-8">
                <h3 className="font-bold text-lg text-slate-800 border-b pb-2">Seus Agendamentos:</h3>
                {consultaResultados.map(agendamento => (
                  <div key={agendamento.id} className="bg-slate-50 p-5 rounded-xl border-l-4 border-blue-500 shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-3">{agendamento.profissional_nome}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <p><span className="font-semibold text-slate-700">Especialidade:</span> {agendamento.especialidade}</p>
                      <p><span className="font-semibold text-slate-700">Data:</span> {agendamento.data}</p>
                      <p><span className="font-semibold text-slate-700">Hora:</span> {agendamento.hora}</p>
                      <p><span className="font-semibold text-slate-700">Status:</span> <span className="text-green-600 font-medium capitalize">{agendamento.status}</span></p>
                    </div>
                    <button 
                      onClick={() => handleCancelar(agendamento.id)}
                      className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
