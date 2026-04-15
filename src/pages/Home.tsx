import Typebot from "../components/Typebot";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section id="home" className="relative h-[80vh] flex items-center justify-center text-center text-white bg-slate-900">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop')" }}
        ></div>
        <div className="relative z-10 max-w-3xl px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Cuidado Moderno para sua Saúde</h1>
          <p className="text-xl mb-10 text-slate-200">A Clínica Médica Care combina tecnologia de ponta com um atendimento humanizado para garantir o seu bem-estar.</p>
          <a href="/agendamento" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors text-lg">
            Agende uma Consulta
          </a>
        </div>
      </section>

      {/* Serviços Section */}
      <section id="servicos" className="py-20 max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-slate-800 mb-16">Nossos Serviços</h2>
        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow">
            <img 
              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1000&auto=format&fit=crop" 
              alt="Atendimento Médico" 
              className="w-full h-64 object-cover rounded-xl mb-6"
              referrerPolicy="no-referrer"
            />
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Atendimento Médico</h3>
            <p className="text-slate-600">Consultas com especialistas em diversas áreas, focadas em um diagnóstico preciso e tratamento eficaz.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow">
            <img 
              src="https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=1000&auto=format&fit=crop" 
              alt="Exames Laboratoriais" 
              className="w-full h-64 object-cover rounded-xl mb-6"
              referrerPolicy="no-referrer"
            />
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Exames Laboratoriais</h3>
            <p className="text-slate-600">Realizamos exames de sangue, imagem e outros procedimentos com equipamentos de última geração.</p>
          </div>
        </div>
      </section>

      {/* Equipe Section */}
      <section id="equipe" className="py-20 bg-slate-100">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-slate-800 mb-16">Nossa Equipe</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { nome: "Dr. Ricardo Santos", esp: "Clínico Geral", img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=500&auto=format&fit=crop" },
              { nome: "Dra. Ana Oliveira", esp: "Nutricionista", img: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?q=80&w=500&auto=format&fit=crop" },
              { nome: "Dra. Beatriz Costa", esp: "Cardiologista", img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=500&auto=format&fit=crop" }
            ].map((medico, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow">
                <img src={medico.img} alt={medico.nome} className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-blue-50" referrerPolicy="no-referrer" />
                <h4 className="text-xl font-bold text-slate-800">{medico.nome}</h4>
                <p className="text-blue-600 font-medium">{medico.esp}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contato Section */}
      <section id="contato" className="py-20 max-w-3xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-slate-800 mb-12">Entre em Contato</h2>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <form className="space-y-6">
            <div>
              <label htmlFor="nome" className="block text-sm font-semibold text-slate-700 mb-2">Nome Completo</label>
              <input type="text" id="nome" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Seu nome" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">E-mail</label>
              <input type="email" id="email" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="seu@email.com" />
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="cidade" className="block text-sm font-semibold text-slate-700 mb-2">Cidade</label>
                <input type="text" id="cidade" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ex: São Paulo" />
              </div>
              <div>
                <label htmlFor="estado" className="block text-sm font-semibold text-slate-700 mb-2">Estado</label>
                <select id="estado" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                  <option value="">Selecione</option>
                  <option value="SP">SP</option>
                  <option value="RJ">RJ</option>
                  <option value="MG">MG</option>
                  <option value="DF">DF</option>
                </select>
              </div>
            </div>
            <button type="button" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              Enviar Mensagem
            </button>
          </form>
        </div>
      </section>

      {/* Typebot Chat */}
      <Typebot />
    </div>
  );
}
