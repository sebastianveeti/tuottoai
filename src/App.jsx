import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Cogs from "./pages/Cogs.jsx";
import Agent from "./pages/Agent.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{display:'flex', gap:12, padding:12, borderBottom:'1px solid #eee'}}>
        <Link to="/">Dashboard</Link>
        <Link to="/cogs">COGS</Link>
        <Link to="/agent">Run Agent</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard/>} />
        <Route path="/cogs" element={<Cogs/>} />
        <Route path="/agent" element={<Agent/>} />
      </Routes>
    </BrowserRouter>
  );
}
