import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { CasesList } from './pages/CasesList';
import { NewCase } from './pages/NewCase';
import { CaseWorkspace } from './pages/CaseWorkspace';

export default function App() {
  return (
    <main className="cf-shell">
      <header className="cf-header">
        <Link to="/cases" className="cf-header-brand">
          <span className="cf-brand-mark">CF</span>
          <span className="cf-brand-text">
            <span className="cf-brand-title">Caseflow</span>
            <span className="cf-brand-sub">Chapter 7 intake</span>
          </span>
        </Link>
      </header>

      <Routes>
        <Route path="/" element={<Navigate to="/cases" replace />} />
        <Route path="/cases" element={<CasesList />} />
        <Route path="/cases/new" element={<NewCase />} />
        <Route path="/cases/:id" element={<CaseWorkspace />} />
      </Routes>
    </main>
  );
}
