import { Link, NavLink } from "react-router";
import BHLogo from '@/assets/blue-horses.png';
import { Trophy, Users, BarChart3 } from 'lucide-react';

export const Header = () => {

  const navItems = [
    { path: '/', label: 'Přehled', icon: BarChart3 },
    { path: '/players', label: 'Hráči', icon: Users },
    { path: '/records', label: 'Rekordy', icon: Trophy },
  ];

  return (
    <header className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Logo + title */}
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-primary-content font-bold text-lg">
              <img src={BHLogo} alt="Blue Horses Logo" />
            </div>

            <div className="leading-tight">
              <div className="text-xl font-bold tracking-wide text-primary">
                BLUE HORSES
              </div>
              <div className="text-sm text-slate-400">
                Statistiky týmu
              </div>
            </div>
          </div>

          {/* Right: Navigation */}
          <nav className="flex items-center gap-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  location.pathname === path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </nav>

        </div>
      </div>
    </header>
  );
};

interface NavItemProps {
  to: string;
  label: string;
  icon: string;
}

const NavItem = ({ to, label, icon }: NavItemProps) => (
  <NavLink
    key={to}
    to={to}
    className="btn btn-sm gap-2 btn-primary"
  >
    <span>{icon}</span>
    {label}
  </NavLink>
);