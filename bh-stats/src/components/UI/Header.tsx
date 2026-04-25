import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import BHLogo from '@/assets/blue-horses.png';
import { BarChart3, CalendarRange, ChevronDown, GitBranch, Shield, Trophy, Users } from 'lucide-react';

export const Header = () => {
  const location = useLocation();
  const [recordsMenuOpen, setRecordsMenuOpen] = useState(false);

  useEffect(() => {
    setRecordsMenuOpen(false);
  }, [location.pathname]);

  const navItemsBeforeRecords = [
    { path: '/', label: 'Historie', icon: Shield },
    { path: '/players', label: 'Hráči', icon: Users },
    { path: '/matches', label: 'Zápasy', icon: CalendarRange },
  ];

  const navItemsAfterRecords = [
    { path: '/series', label: 'Série', icon: GitBranch },
    { path: '/overview', label: 'Přehled', icon: BarChart3 },
  ];

  const recordsActive = location.pathname.startsWith('/records');

  return (
    <header className="sticky top-0 z-40 border-b border-cyan-400/10 bg-slate-950/85 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-20 flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:py-0">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10">
              <img src={BHLogo} alt="Blue Horses Logo" className="h-12 w-12 object-contain" />
            </div>

            <div className="leading-tight">
              <div className="text-lg font-bold uppercase tracking-[0.3em] text-cyan-200">Blue Horses</div>
              <div className="text-sm text-slate-400">Historie týmu, statistiky hráčů a správa zápasů</div>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            {navItemsBeforeRecords.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-cyan-300 text-slate-950 shadow-[0_10px_30px_-14px_rgba(103,232,249,0.9)]'
                      : 'text-slate-300 hover:bg-white/6 hover:text-white'
                  }`
                }
                end={path === '/' || path === '/overview'}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </NavLink>
            ))}

            <div className="relative">
              <button
                type="button"
                onClick={() => setRecordsMenuOpen((open) => !open)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  recordsActive || recordsMenuOpen
                    ? 'bg-cyan-300 text-slate-950 shadow-[0_10px_30px_-14px_rgba(103,232,249,0.9)]'
                    : 'text-slate-300 hover:bg-white/6 hover:text-white'
                }`}
              >
                <Trophy className="h-4 w-4" />
                <span>Rekordy</span>
                <ChevronDown className={`h-4 w-4 transition ${recordsMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {recordsMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[220px] rounded-[24px] border border-white/10 bg-slate-950/95 p-2 shadow-[0_24px_60px_-30px_rgba(2,6,23,0.95)] backdrop-blur-xl">
                  <Link
                    to="/records/player"
                    className={`block rounded-2xl px-4 py-3 text-sm transition ${
                      location.pathname === '/records/player'
                        ? 'bg-cyan-300 text-slate-950'
                        : 'text-slate-200 hover:bg-white/6 hover:text-white'
                    }`}
                  >
                    <div className="font-semibold">Hráčské rekordy</div>
                  </Link>
                  <Link
                    to="/records/team"
                    className={`mt-1 block rounded-2xl px-4 py-3 text-sm transition ${
                      location.pathname === '/records/team'
                        ? 'bg-cyan-300 text-slate-950'
                        : 'text-slate-200 hover:bg-white/6 hover:text-white'
                    }`}
                  >
                    <div className="font-semibold">Týmové rekordy</div>
                  </Link>
                </div>
              ) : null}
            </div>

            {navItemsAfterRecords.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-cyan-300 text-slate-950 shadow-[0_10px_30px_-14px_rgba(103,232,249,0.9)]'
                      : 'text-slate-300 hover:bg-white/6 hover:text-white'
                  }`
                }
                end={path === '/' || path === '/overview'}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};
