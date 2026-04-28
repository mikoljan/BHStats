import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, Import, Link2, PlusCircle } from 'lucide-react';
import { getSeasons, importMatchFromCeskyFlorbal } from '@utils/api';
import type { Season } from '@models/season';
import type { SquadId } from '@models/player';

const teamOptions: SquadId[] = ['A', 'B', 'C'];

export const MatchImportPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [link, setLink] = useState('');
  const [team, setTeam] = useState<SquadId>((searchParams.get('team') as SquadId) || 'A');
  const [year, setYear] = useState(searchParams.get('year') ?? '');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const nextSeasons = await getSeasons();
        const orderedSeasons = [...nextSeasons].sort((left, right) => right.year.localeCompare(left.year, 'cs'));
        setSeasons(orderedSeasons);

        const firstSeasonForTeam = orderedSeasons.find((season) => season.team === team)?.year ?? orderedSeasons[0]?.year ?? '';
        setYear(firstSeasonForTeam);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [team]);

  const seasonOptions = useMemo(() => {
    const filteredSeasons = seasons.filter((season) => season.team === team);
    return filteredSeasons.length > 0 ? filteredSeasons : seasons;
  }, [seasons, team]);

  useEffect(() => {
    if (seasonOptions.some((season) => season.year === year)) {
      return;
    }

    setYear(seasonOptions[0]?.year ?? '');
  }, [seasonOptions, year]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!link.trim() || !year) {
      setError('Vyplň link a vyber sezónu.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const importedMatch = await importMatchFromCeskyFlorbal({
        link: link.trim(),
        team,
        year,
      });

      navigate(`/matches/${importedMatch.id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Import zápasu se nepovedl.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="panel-soft p-8 text-slate-300">Načítám formulář pro import zápasu…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Import zápasu</p>
          <h1 className="section-title text-4xl">Načtení zápasu z odkazu</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Vlož link z Českého florbalu, vyber tým a sezónu. Po vytvoření tě aplikace přesměruje rovnou do editace zápasu.
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

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
        <form onSubmit={handleSubmit} className="panel-soft space-y-5 p-5 sm:p-6">
          <div>
            <label htmlFor="match-link" className="text-sm font-semibold text-slate-200">
              Link na zápas
            </label>
            <div className="mt-2 flex items-center gap-3 rounded-[24px] border border-white/10 bg-slate-950/55 px-4 py-3">
              <Link2 className="h-5 w-5 text-cyan-200" />
              <input
                id="match-link"
                type="url"
                value={link}
                onChange={(event) => setLink(event.target.value)}
                placeholder="https://fis.ceskyflorbal.cz/..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="team" className="text-sm font-semibold text-slate-200">
                Tým
              </label>
              <select
                id="team"
                value={team}
                onChange={(event) => setTeam(event.target.value as SquadId)}
                className="mt-2 w-full rounded-[20px] border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
              >
                {teamOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="season" className="text-sm font-semibold text-slate-200">
                Sezóna
              </label>
              <select
                id="season"
                value={year}
                onChange={(event) => setYear(event.target.value)}
                className="mt-2 w-full rounded-[20px] border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
                required
              >
                {seasonOptions.map((season) => (
                  <option key={season.id} value={season.year}>
                    {season.year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? (
            <div className="rounded-[24px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting || !year}
            className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
          >
            <Import className="h-4 w-4" />
            {submitting ? 'Importuji zápas…' : 'Importovat a otevřít detail'}
          </button>

          <Link
            to="/seasons/create"
            className="ml-3 inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/6 hover:text-white"
          >
            <PlusCircle className="h-4 w-4" />
            Vytvořit sezónu
          </Link>
        </form>

        <aside className="panel-soft p-5 sm:p-6">
          <div className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Formát importu</div>
          <h2 className="mt-3 text-2xl font-semibold text-white">Co se odešle na backend</h2>
          <div className="mt-4 rounded-[24px] border border-white/10 bg-slate-950/60 p-4 font-mono text-xs leading-6 text-slate-200">
            <div>{'{'}</div>
            <div className="pl-4">"link": "{link || 'https://fis.ceskyflorbal.cz/...'}",</div>
            <div className="pl-4">"year": "{year || '2023/2024'}",</div>
            <div className="pl-4">"team": "{team}"</div>
            <div>{'}'}</div>
          </div>
          <p className="mt-4 text-sm text-slate-300">
            Po úspěšném importu se očekává návrat alespoň identifikátoru nově vytvořeného zápasu, aby šlo okamžitě otevřít jeho editaci.
          </p>
        </aside>
      </section>
    </div>
  );
};