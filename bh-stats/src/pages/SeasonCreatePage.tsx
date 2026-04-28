import { useState } from 'react';
import { ArrowLeft, CalendarPlus, PlusCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { createSeason } from '@utils/api';
import type { SquadId } from '@models/player';
import type { SeasonMovement } from '@models/season';

const teamOptions: SquadId[] = ['A', 'B', 'C'];
const movementOptions: Array<{ value: SeasonMovement; label: string }> = [
  { value: null, label: 'Bez změny soutěže' },
  { value: 'promotion', label: 'Postup' },
  { value: 'relegation', label: 'Sestup' },
];
const competitionOptions = [
  { name: 'Superliga', level: 1 },
  { name: '1. Liga mužů', level: 2 },
  { name: 'Národní liga', level: 3 },
  { name: 'Divize', level: 4 },
  { name: 'Regionální liga mužů', level: 5 },
  { name: 'Liga mužů', level: 6 },
  { name: 'Přebor mužů', level: 7 },
  { name: 'Soutěž mužů', level: 8 },
  { name: 'Třída mužů', level: 9 },
] as const;

const emptyForm = {
  year: '',
  team: 'A' as SquadId,
  leagueLevel: '1',
  leagueName: 'Superliga',
  position: '',
  movement: '' as '' | Exclude<SeasonMovement, null>,
  covidInterrupted: false,
};

export const SeasonCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateCompetition = (level: string) => {
    const selectedCompetition = competitionOptions.find((option) => String(option.level) === level);

    setForm((current) => ({
      ...current,
      leagueLevel: level,
      leagueName: selectedCompetition?.name ?? current.leagueName,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.year.trim()) {
      setError('Vyplň ročník sezóny.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const createdSeason = await createSeason({
        year: form.year.trim(),
        team: form.team,
        leagueLevel: Number(form.leagueLevel),
        leagueName: form.leagueName.trim(),
        position: form.position.trim() ? Number(form.position) : null,
        movement: form.movement || null,
        covidInterrupted: form.covidInterrupted,
      });

      navigate(`/matches/import?team=${createdSeason.team}&year=${encodeURIComponent(createdSeason.year)}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Vytvoření sezóny se nepovedlo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Sezóny</p>
          <h1 className="section-title text-4xl">Vytvoření nové sezóny</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Založ novou sezónu pro vybraný tým a soutěž. Po uložení tě aplikace přesměruje rovnou na import zápasu.
          </p>
        </div>

        <Link
          to="/matches"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/6 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Zpět na zápasy
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
        <form onSubmit={handleSubmit} className="panel-soft space-y-5 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="season-year" className="text-sm font-semibold text-slate-200">
                Ročník sezóny
              </label>
              <input
                id="season-year"
                type="text"
                value={form.year}
                onChange={(event) => updateField('year', event.target.value)}
                placeholder="2024/2025"
                className="mt-2 w-full rounded-[20px] border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40"
                required
              />
            </div>

            <div>
              <label htmlFor="season-team" className="text-sm font-semibold text-slate-200">
                Tým
              </label>
              <select
                id="season-team"
                value={form.team}
                onChange={(event) => updateField('team', event.target.value as SquadId)}
                className="mt-2 w-full rounded-[20px] border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
              >
                {teamOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="season-competition" className="text-sm font-semibold text-slate-200">
                Soutěž a úroveň
              </label>
              <select
                id="season-competition"
                value={form.leagueLevel}
                onChange={(event) => updateCompetition(event.target.value)}
                className="mt-2 w-full rounded-[20px] border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
                required
              >
                {competitionOptions.map((option) => (
                  <option key={option.level} value={option.level}>
                    {option.name} - {option.level}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="season-league-name" className="text-sm font-semibold text-slate-200">
                Název soutěže
              </label>
              <input
                id="season-league-name"
                type="text"
                value={form.leagueName}
                readOnly
                className="mt-2 w-full rounded-[20px] border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-200 outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="season-position" className="text-sm font-semibold text-slate-200">
                Umístění v tabulce
              </label>
              <input
                id="season-position"
                type="number"
                min={1}
                step={1}
                value={form.position}
                onChange={(event) => updateField('position', event.target.value)}
                placeholder="např. 3"
                className="mt-2 w-full rounded-[20px] border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40"
              />
            </div>

            <div>
              <label htmlFor="season-movement" className="text-sm font-semibold text-slate-200">
                Pohyb mezi soutěžemi
              </label>
              <select
                id="season-movement"
                value={form.movement}
                onChange={(event) => updateField('movement', event.target.value as '' | Exclude<SeasonMovement, null>)}
                className="mt-2 w-full rounded-[20px] border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
              >
                {movementOptions.map((option) => (
                  <option key={option.label} value={option.value ?? ''}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="inline-flex items-center gap-3 rounded-[20px] border border-white/10 bg-slate-950/45 px-4 py-3 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={form.covidInterrupted}
                onChange={(event) => updateField('covidInterrupted', event.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-slate-900 text-cyan-300"
              />
              Covid přerušená sezóna
            </label>
          </div>

          {error ? (
            <div className="rounded-[24px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
          >
            <PlusCircle className="h-4 w-4" />
            {submitting ? 'Vytvářím sezónu…' : 'Vytvořit sezónu'}
          </button>
        </form>

        <aside className="panel-soft p-5 sm:p-6">
          <div className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Payload</div>
          <h2 className="mt-3 text-2xl font-semibold text-white">Co se pošle na backend</h2>
          <div className="mt-4 rounded-[24px] border border-white/10 bg-slate-950/60 p-4 font-mono text-xs leading-6 text-slate-200">
            <div>{'{'}</div>
            <div className="pl-4">"year": "{form.year || '2024/2025'}",</div>
            <div className="pl-4">"team": "{form.team}",</div>
            <div className="pl-4">"leagueLevel": {form.leagueLevel || '1'},</div>
            <div className="pl-4">"leagueName": "{form.leagueName || 'Superliga'}",</div>
            <div className="pl-4">"position": {form.position || 'null'},</div>
            <div className="pl-4">"movement": {form.movement ? `"${form.movement}"` : 'null'},</div>
            <div className="pl-4">"covidInterrupted": {form.covidInterrupted ? 'true' : 'false'}</div>
            <div>{'}'}</div>
          </div>
          <div className="mt-5 rounded-[24px] border border-cyan-300/10 bg-cyan-400/5 p-4 text-sm text-slate-300">
            <div className="flex items-center gap-2 font-semibold text-cyan-100">
              <CalendarPlus className="h-4 w-4" />
              Navazující krok
            </div>
            <p className="mt-2">
              Po založení sezóny tě aplikace pošle na import zápasu, aby šlo novou sezónu rovnou použít při načítání utkání z linku.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
};