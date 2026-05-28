import { Navigate, Route, Routes } from 'react-router-dom';
import { CasesList } from './pages/CasesList';
import { CaseWorkspace } from './pages/CaseWorkspace';
import { useDarkMode } from './hooks/useDarkMode';

export default function App() {
  const { dark, toggle } = useDarkMode();

  return (
    <div className={`aur${dark ? ' dark' : ''}`}>
      <div className="au-main">
        <Routes>
          <Route path="/" element={<Navigate to="/cases" replace />} />
          <Route path="/cases" element={<CasesList dark={dark} onToggleDark={toggle} />} />
          <Route path="/cases/new" element={<CasesList dark={dark} onToggleDark={toggle} />} />
          <Route path="/cases/:id" element={<CaseWorkspace dark={dark} onToggleDark={toggle} />} />
        </Routes>
      </div>
    </div>
  );
}
