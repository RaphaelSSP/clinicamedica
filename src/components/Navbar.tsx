import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  const isHome = location.pathname === "/";

  return (
    <header className="bg-white shadow-sm fixed w-full top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-slate-800">Clínica Médica Care</div>
        <ul className="flex space-x-6">
          <li>
            <Link to="/" className={`font-semibold transition-colors hover:text-blue-500 ${isHome ? 'text-blue-500' : 'text-slate-700'}`}>Home</Link>
          </li>
          {isHome && (
            <>
              <li>
                <a href="#servicos" className="font-semibold text-slate-700 transition-colors hover:text-blue-500">Serviços</a>
              </li>
              <li>
                <a href="#equipe" className="font-semibold text-slate-700 transition-colors hover:text-blue-500">Equipe</a>
              </li>
              <li>
                <a href="#contato" className="font-semibold text-slate-700 transition-colors hover:text-blue-500">Contato</a>
              </li>
            </>
          )}
          <li>
            <Link to="/agendamento" className={`font-semibold transition-colors hover:text-blue-500 ${!isHome ? 'text-blue-500' : 'text-slate-700'}`}>Agendamento</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
