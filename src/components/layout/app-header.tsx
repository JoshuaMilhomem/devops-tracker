import { Link } from '@tanstack/react-router';
import { BarChart3, History, ListTodo } from 'lucide-react';

import { ActiveTaskWidget } from '@/components/layout/active-task-widget';

const NavLink = ({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: React.ComponentType<{ size: number }>;
  label: string;
}) => (
  <Link
    to={to}
    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors [&.active]:bg-accent [&.active]:text-accent-foreground [&.active]:shadow-sm"
  >
    <Icon size={16} /> <span className="hidden sm:inline">{label}</span>
  </Link>
);

export function AppHeader() {
  return (
    <header className="border-b bg-background/95 sticky top-0 z-10 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-5xl flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 group mr-auto">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-transform">
            DT
          </div>
          <h1 className="font-bold text-xl hidden sm:block group-hover:text-primary transition-colors">
            DevOps<span className="text-muted-foreground group-hover:text-primary/70">Tracker</span>
          </h1>
        </Link>

        <ActiveTaskWidget />

        <nav className="flex gap-1 bg-muted/50 p-1 rounded-lg border">
          <NavLink to="/" icon={ListTodo} label="Tracker" />
          <NavLink to="/history" icon={History} label="Histórico" />
          <NavLink to="/dashboard" icon={BarChart3} label="Dash" />
        </nav>
      </div>
    </header>
  );
}
