import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { Header } from '@components/UI/Header';
import { MainPage } from '@pages/MainPage';
import { MatchDetailPage } from '@pages/MatchDetailPage';
import { MatchesPage } from '@pages/MatchesPage';
import { OverviewPage } from '@pages/OverviewPage';
import { PlayerDetailPage } from '@pages/PlayerDetailPage';
import { PlayersPage } from '@pages/PlayersPage';
import { RecordsPage } from '@pages/RecordsPage';

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell min-h-screen">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/players/:playerId" element={<PlayerDetailPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/matches/:matchId" element={<MatchDetailPage />} />
            <Route path="/records" element={<RecordsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
