import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Agendamento from "./pages/Agendamento";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
        <Navbar />
        <main className="flex-grow mt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/agendamento" element={<Agendamento />} />
          </Routes>
        </main>
        <footer className="bg-slate-800 text-white text-center py-10 mt-16">
          <p>&copy; 2026 Clínica Médica Care. Site desenvolvido como resultado da sistematização da matéria "Programação e Desenvolvimento Web" do curso de "Análise e Desenvolvimento de Sistema" na UniCeub.</p>
        </footer>
      </div>
    </Router>
  );
}
