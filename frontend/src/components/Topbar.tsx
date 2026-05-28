import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';

interface Props {
  crumb: ReactNode;
  right?: ReactNode;
  dark: boolean;
  onToggleDark: () => void;
}

export function Topbar({ crumb, right, dark, onToggleDark }: Props) {
  const navigate = useNavigate();
  return (
    <div className="au-topbar">
      <div className="au-topbar-l">
        <button
          type="button"
          className="au-mark"
          onClick={() => navigate('/cases')}
          aria-label="Caseflow home"
        >
          <span>C</span>
        </button>
        <div className="au-crumb">{crumb}</div>
      </div>
      <div className="au-topbar-r">
        <button
          className="au-iconbtn"
          onClick={onToggleDark}
          title={dark ? 'Switch to light' : 'Switch to dark'}
          aria-label="Toggle theme"
        >
          {dark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        {right}
      </div>
    </div>
  );
}
