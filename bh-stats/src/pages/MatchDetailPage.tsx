import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { getMatchById, getPlayers, getSeasons, getStadiums, updateMatch } from '@utils/api';
import { formatDate, getScoreLabel } from '@utils/helpers';
import type { Goal, Match, MatchResult, Penalty } from '@models/match';
import type { Player } from '@models/player';
import type { Season } from '@models/season';
import type { Stadium } from '@models/stadium';

const emptyGoal = (matchId: string): Goal => ({
  id: `goal-${crypto.randomUUID()}`,
  type: 'even strength',
  time: 0,
  scorerId: null,
  assistId: null,
  matchId,
  ourTeam: true,
  winningGoal: false,
  equalizingGoal: false,
});

const emptyPenalty = (matchId: string): Penalty => ({
  id: `penalty-${crypto.randomUUID()}`,
  type: 'minor',
  time: 0,
  penaltyMinutes: 2,
  playerId: null,
  matchId,
  ourTeam: true,
});

const determineResult = (ourScore: number, opponentScore: number): MatchResult => {
  if (ourScore > opponentScore) {
    return 'W';
  }

  if (ourScore < opponentScore) {
    return 'L';
  }

  return 'D';
};

export const MatchDetailPage = () => {
  const { matchId = '' } = useParams();
  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const load = async () => {
      const [nextMatch, nextPlayers, nextSeasons, nextStadiums] = await Promise.all([
        getMatchById(matchId),
        getPlayers(),
        getSeasons(),
        getStadiums(),
      ]);

      setMatch(nextMatch ?? null);
      setPlayers(nextPlayers);
      setSeasons(nextSeasons);
      setStadiums(nextStadiums);
      setLoading(false);
    };

    void load();
  }, [matchId]);

  const updateField = <K extends keyof Match>(key: K, value: Match[K]) => {
    setMatch((current) => {
      if (!current) {
        return current;
      }

      const nextMatch = {
        ...current,
        [key]: value,
      };

      if (key === 'ourScore' || key === 'opponentScore') {
        nextMatch.result = determineResult(nextMatch.ourScore, nextMatch.opponentScore);
      }

      return nextMatch;
    });
  };

  const togglePlayer = (playerId: string) => {
    setMatch((current) => {
      if (!current) {
        return current;
      }

      const nextIds = current.presentPlayerIds.includes(playerId)
        ? current.presentPlayerIds.filter((id) => id !== playerId)
        : [...current.presentPlayerIds, playerId];

      return {
        ...current,
        presentPlayerIds: nextIds,
      };
    });
  };

  const updateGoal = (goalId: string, patch: Partial<Goal>) => {
    setMatch((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        goals: current.goals.map((goal) => (goal.id === goalId ? { ...goal, ...patch } : goal)),
      };
    });
  };

  const updatePenaltyEntry = (penaltyId: string, patch: Partial<Penalty>) => {
    setMatch((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        penalties: current.penalties.map((penalty) =>
          penalty.id === penaltyId ? { ...penalty, ...patch } : penalty,
        ),
      };
    });
  };

  const updateGoalieMinutes = (index: number, playerId: string, minutesPlayed: number) => {
    setMatch((current) => {
      if (!current) {
        return current;
      }

      const nextGoalies = [...current.goalieMinutes];
      nextGoalies[index] = {
        playerId,
        minutesPlayed,
      };

      return {
        ...current,
        goalieMinutes: nextGoalies,
      };
    });
  };

  const removeGoal = (goalId: string) => {
    setMatch((current) => (current ? { ...current, goals: current.goals.filter((goal) => goal.id !== goalId) } : current));
  };

  const removePenalty = (penaltyId: string) => {
    setMatch((current) =>
      current ? { ...current, penalties: current.penalties.filter((penalty) => penalty.id !== penaltyId) } : current,
    );
  };

  const removeGoalie = (index: number) => {
    setMatch((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        goalieMinutes: current.goalieMinutes.filter((_, currentIndex) => currentIndex !== index),
      };
    });
  };

  const addGoal = () => {
    setMatch((current) => (current ? { ...current, goals: [...current.goals, emptyGoal(current.id)] } : current));
  };

  const addPenalty = () => {
    setMatch((current) =>
      current ? { ...current, penalties: [...current.penalties, emptyPenalty(current.id)] } : current,
    );
  };

  const addGoalie = () => {
    const firstGoalie = players.find((player) => player.position === 'goalie')?.id ?? players[0]?.id ?? '';
    setMatch((current) =>
      current
        ? {
            ...current,
            goalieMinutes: [...current.goalieMinutes, { playerId: firstGoalie, minutesPlayed: 0 }],
          }
        : current,
    );
  };

  const handleSave = async () => {
    if (!match) {
      return;
    }

    setSaving(true);
    setStatus('');

    try {
      const saved = await updateMatch(match.id, {
        ...match,
        result: determineResult(match.ourScore, match.opponentScore),
      });

      setMatch(saved);
      setStatus('Změny byly uložené do lokálního frontendu.');
    } catch {
      setStatus('Uložení se nepovedlo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="panel-soft p-8 text-slate-300">Načítám detail zápasu…</div>;
  }

  if (!match) {
    return (
      <div className="panel-soft space-y-4 p-8">
        <h1 className="text-2xl font-semibold text-white">Zápas nebyl nalezen</h1>
        <Link to="/matches" className="inline-flex items-center gap-2 text-cyan-200 transition hover:text-cyan-100">
          <ArrowLeft className="h-4 w-4" />
          Zpět na zápasy
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link to="/matches" className="mb-4 inline-flex items-center gap-2 text-sm text-cyan-200 transition hover:text-cyan-100">
            <ArrowLeft className="h-4 w-4" />
            Zpět na přehled zápasů
          </Link>
          <p className="eyebrow">Detail zápasu</p>
          <h1 className="text-4xl font-bold text-white">Blue Horses vs. {match.opponent}</h1>
          <p className="mt-2 text-slate-300">
            {formatDate(match.date)} • {getScoreLabel(match.ourScore, match.opponentScore)} • {match.homeGame ? 'Domácí' : 'Venku'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Ukládám…' : 'Uložit změny'}
        </button>
      </div>

      {status ? <div className="panel-soft px-5 py-4 text-sm text-slate-200">{status}</div> : null}

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="panel-soft space-y-4 p-6">
          <h2 className="text-xl font-semibold text-white">Základní údaje</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="form-field">
              <span>Datum</span>
              <input type="date" value={match.date} onChange={(event) => updateField('date', event.target.value)} />
            </label>
            <label className="form-field">
              <span>Soupeř</span>
              <input type="text" value={match.opponent} onChange={(event) => updateField('opponent', event.target.value)} />
            </label>
            <label className="form-field">
              <span>Sezóna</span>
              <select value={match.seasonId} onChange={(event) => updateField('seasonId', event.target.value)}>
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.year}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Stadion</span>
              <select value={match.stadiumId ?? ''} onChange={(event) => updateField('stadiumId', event.target.value || null)}>
                <option value="">Bez stadionu</option>
                {stadiums.map((stadium) => (
                  <option key={stadium.id} value={stadium.id}>
                    {stadium.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Délka zápasu</span>
              <input
                type="number"
                min={1}
                value={match.matchLength}
                onChange={(event) => updateField('matchLength', Number(event.target.value))}
              />
            </label>
            <label className="form-field">
              <span>Výsledek</span>
              <select value={match.result} onChange={(event) => updateField('result', event.target.value as MatchResult)}>
                <option value="W">Výhra</option>
                <option value="D">Remíza</option>
                <option value="L">Prohra</option>
              </select>
            </label>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            <input type="checkbox" checked={match.homeGame} onChange={(event) => updateField('homeGame', event.target.checked)} />
            Domácí zápas
          </label>
        </div>

        <div className="panel-soft space-y-4 p-6">
          <h2 className="text-xl font-semibold text-white">Skóre a brankáři</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="form-field">
              <span>Naše góly</span>
              <input type="number" min={0} value={match.ourScore} onChange={(event) => updateField('ourScore', Number(event.target.value))} />
            </label>
            <label className="form-field">
              <span>Góly soupeře</span>
              <input
                type="number"
                min={0}
                value={match.opponentScore}
                onChange={(event) => updateField('opponentScore', Number(event.target.value))}
              />
            </label>
          </div>

          <div className="rounded-2xl border border-cyan-300/15 bg-cyan-400/8 p-4">
            <div className="text-xs uppercase tracking-[0.24em] text-cyan-100/70">Aktuální tabule</div>
            <div className="mt-2 text-3xl font-bold text-white">{getScoreLabel(match.ourScore, match.opponentScore)}</div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">Brankářské minuty</h3>
              <button type="button" onClick={addGoalie} className="inline-flex items-center gap-2 text-sm text-cyan-200 transition hover:text-cyan-100">
                <Plus className="h-4 w-4" /> Přidat
              </button>
            </div>
            {match.goalieMinutes.map((goalieEntry, index) => (
              <div key={`${goalieEntry.playerId}-${index}`} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_140px_auto]">
                <label className="form-field compact">
                  <span>Brankář</span>
                  <select
                    value={goalieEntry.playerId}
                    onChange={(event) => updateGoalieMinutes(index, event.target.value, goalieEntry.minutesPlayed)}
                  >
                    {players
                      .filter((player) => player.position === 'goalie')
                      .map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="form-field compact">
                  <span>Minuty</span>
                  <input
                    type="number"
                    min={0}
                    value={goalieEntry.minutesPlayed}
                    onChange={(event) => updateGoalieMinutes(index, goalieEntry.playerId, Number(event.target.value))}
                  />
                </label>
                <button type="button" onClick={() => removeGoalie(index)} className="mt-auto inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-rose-200 transition hover:bg-rose-400/10">
                  <Trash2 className="h-4 w-4" /> Odebrat
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel-soft space-y-5 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Sestava</h2>
            <p className="mt-1 text-sm text-slate-300">Vyber hráče, kteří byli přítomní v zápase.</p>
          </div>
          <div className="rounded-full bg-white/5 px-4 py-2 text-sm text-slate-300">{match.presentPlayerIds.length} hráčů</div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {players.map((player) => {
            const active = match.presentPlayerIds.includes(player.id);
            return (
              <label
                key={player.id}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                  active
                    ? 'border-cyan-300/40 bg-cyan-400/10 text-white'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/8'
                }`}
              >
                <input type="checkbox" checked={active} onChange={() => togglePlayer(player.id)} />
                <span>{player.name}</span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="panel-soft space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Góly</h2>
              <p className="mt-1 text-sm text-slate-300">Uprav čas, autora, asistenci i příznaky klíčových gólů.</p>
            </div>
            <button type="button" onClick={addGoal} className="inline-flex items-center gap-2 text-sm text-cyan-200 transition hover:text-cyan-100">
              <Plus className="h-4 w-4" /> Přidat gól
            </button>
          </div>

          <div className="space-y-4">
            {match.goals.map((goal) => (
              <div key={goal.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="form-field compact">
                    <span>Typ</span>
                    <input type="text" value={goal.type} onChange={(event) => updateGoal(goal.id, { type: event.target.value })} />
                  </label>
                  <label className="form-field compact">
                    <span>Čas</span>
                    <input type="number" min={0} value={goal.time} onChange={(event) => updateGoal(goal.id, { time: Number(event.target.value) })} />
                  </label>
                  <label className="form-field compact">
                    <span>Střelec</span>
                    <select value={goal.scorerId ?? ''} onChange={(event) => updateGoal(goal.id, { scorerId: event.target.value || null })}>
                      <option value="">Neuveden</option>
                      {players.map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="form-field compact">
                    <span>Asistence</span>
                    <select value={goal.assistId ?? ''} onChange={(event) => updateGoal(goal.id, { assistId: event.target.value || null })}>
                      <option value="">Bez asistence</option>
                      {players.map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <label className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-slate-200">
                    <input type="checkbox" checked={goal.ourTeam} onChange={(event) => updateGoal(goal.id, { ourTeam: event.target.checked })} />
                    Náš tým
                  </label>
                  <label className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-slate-200">
                    <input type="checkbox" checked={goal.winningGoal} onChange={(event) => updateGoal(goal.id, { winningGoal: event.target.checked })} />
                    Vítězný gól
                  </label>
                  <label className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-slate-200">
                    <input type="checkbox" checked={goal.equalizingGoal} onChange={(event) => updateGoal(goal.id, { equalizingGoal: event.target.checked })} />
                    Vyrovnávací gól
                  </label>
                </div>
                <button type="button" onClick={() => removeGoal(goal.id)} className="mt-4 inline-flex items-center gap-2 text-sm text-rose-200 transition hover:text-rose-100">
                  <Trash2 className="h-4 w-4" /> Odebrat gól
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-soft space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Tresty</h2>
              <p className="mt-1 text-sm text-slate-300">Lokální editace disciplinárních záznamů ze zápasu.</p>
            </div>
            <button type="button" onClick={addPenalty} className="inline-flex items-center gap-2 text-sm text-cyan-200 transition hover:text-cyan-100">
              <Plus className="h-4 w-4" /> Přidat trest
            </button>
          </div>

          <div className="space-y-4">
            {match.penalties.map((penalty) => (
              <div key={penalty.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="form-field compact">
                    <span>Typ</span>
                    <input
                      type="text"
                      value={penalty.type}
                      onChange={(event) => updatePenaltyEntry(penalty.id, { type: event.target.value })}
                    />
                  </label>
                  <label className="form-field compact">
                    <span>Čas</span>
                    <input
                      type="number"
                      min={0}
                      value={penalty.time}
                      onChange={(event) => updatePenaltyEntry(penalty.id, { time: Number(event.target.value) })}
                    />
                  </label>
                  <label className="form-field compact">
                    <span>Hráč</span>
                    <select
                      value={penalty.playerId ?? ''}
                      onChange={(event) => updatePenaltyEntry(penalty.id, { playerId: event.target.value || null })}
                    >
                      <option value="">Neuveden</option>
                      {players.map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="form-field compact">
                    <span>Minuty</span>
                    <input
                      type="number"
                      min={0}
                      value={penalty.penaltyMinutes}
                      onChange={(event) => updatePenaltyEntry(penalty.id, { penaltyMinutes: Number(event.target.value) })}
                    />
                  </label>
                </div>
                <label className="mt-4 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={penalty.ourTeam}
                    onChange={(event) => updatePenaltyEntry(penalty.id, { ourTeam: event.target.checked })}
                  />
                  Náš tým
                </label>
                <button type="button" onClick={() => removePenalty(penalty.id)} className="mt-4 inline-flex items-center gap-2 text-sm text-rose-200 transition hover:text-rose-100">
                  <Trash2 className="h-4 w-4" /> Odebrat trest
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};