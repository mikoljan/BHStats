import { useEffect, useMemo, useState } from 'react';
import { ScopeTabs, type TeamScope } from '@components/UI/ScopeTabs';
import { getOverview, getSeasons, type OverviewResponse } from '@utils/api';
import { scopeLabel } from '@utils/statistics';
import type { Season } from '@models/season';

const formatPercent = (value: number) => value.toFixed(2).replace('.', ',');

const movementLabel = {
	promotion: 'Postup',
	relegation: 'Sestup',
} as const;

const getSeasonDescriptor = (season: Season | undefined) => {
	if (!season) {
		return 'Celkové statistiky';
	}

	const movementSuffix = season.movement ? ` • ${movementLabel[season.movement]}` : '';

	if (season.covidInterrupted) {
		return season.position ? `${season.position}. místo - nedohráno (COVID)${movementSuffix}` : `Nedohráno (COVID)${movementSuffix}`;
	}

	return season.position ? `${season.position}. místo${movementSuffix}` : `${season.leagueName}${movementSuffix}`;
};
export const OverviewPage = () => {
	const [seasons, setSeasons] = useState<Season[]>([]);
	const [overviewData, setOverviewData] = useState<OverviewResponse | null>(null);
	const [scope, setScope] = useState<TeamScope>('ALL');
	const [seasonId, setSeasonId] = useState('ALL');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadSeasons = async () => {
			const nextSeasons = await getSeasons();
			setSeasons(nextSeasons);
		};

		void loadSeasons();
	}, []);

	useEffect(() => {
		const loadOverview = async () => {
			setLoading(true);
			const nextOverview = await getOverview(scope, seasonId);
			setOverviewData(nextOverview);
			setLoading(false);
		};

		void loadOverview();
	}, [scope, seasonId]);

	const seasonOptions = useMemo(
		() => [...seasons].sort((left, right) => right.year.localeCompare(left.year, 'cs')),
		[seasons],
	);
	const selectedSeason = seasonOptions.find((season) => season.id === seasonId);
	const overview = overviewData?.summary ?? {
		matches: 0,
		wins: 0,
		overtimeWins: 0,
		draws: 0,
		overtimeLosses: 0,
		losses: 0,
		points: 0,
		goalsFor: 0,
		goalsAgainst: 0,
		goalDiff: 0,
		powerPlayOpportunities: 0,
		powerPlayGoals: 0,
		powerPlayEfficiency: 0,
		powerPlayGoalsAgainst: 0,
		penaltyKillOpportunities: 0,
		penaltyKillGoalsAgainst: 0,
		penaltyKillEfficiency: 0,
		shorthandedGoals: 0,
	};

	if (loading) {
		return <div className="panel-soft p-8 text-slate-300">Načítám celkový přehled…</div>;
	}

	return (
		<div className="space-y-8">
			<section className="panel-soft p-6 sm:p-8">
				<div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
					<div>
						<p className="eyebrow">Přehled</p>
						<h1 className="section-title text-4xl">Celkové statistiky po sezonách</h1>
						<p className="mt-3 max-w-3xl text-slate-300">
							Sezónní souhrn je postavený ve stejném rytmu jako původní tabulky: bilance zápasů, body, skóre a speciální týmy
							v jednom kompaktním bloku.
						</p>
						<div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center">
							<ScopeTabs value={scope} onChange={setScope} />
							<label className="flex min-w-[240px] items-center gap-3 rounded-full border border-white/10 bg-slate-950/50 px-4 py-2.5 text-sm text-slate-300">
								<span className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Sezóna</span>
								<select
									value={seasonId}
									onChange={(event) => setSeasonId(event.target.value)}
									className="w-full bg-transparent text-sm font-semibold text-white outline-none"
								>
									<option value="ALL" className="bg-slate-900 text-white">Všechny sezony</option>
									{seasonOptions.map((season) => (
										<option key={season.id} value={season.id} className="bg-slate-900 text-white">
											{season.year}
										</option>
									))}
								</select>
							</label>
						</div>
					</div>

					<div className="grid min-w-[280px] gap-3 sm:grid-cols-2 xl:w-[380px]">
						<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
							<div className="text-xs uppercase tracking-[0.24em] text-slate-400">Výběr</div>
							<div className="mt-2 text-2xl font-bold text-white">{selectedSeason?.year ?? 'Celkově'}</div>
							<div className="mt-1 text-sm text-slate-300">Blue Horses {scopeLabel[scope]}</div>
						</div>
						<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
							<div className="text-xs uppercase tracking-[0.24em] text-slate-400">Stav sezony</div>
							<div className="mt-2 text-lg font-bold text-white">{getSeasonDescriptor(selectedSeason)}</div>
							<div className="mt-1 text-sm text-slate-300">{selectedSeason?.leagueName ?? 'Souhrn přes všechny sezony'}</div>
						</div>
					</div>
				</div>
			</section>

			<section className="panel-soft overflow-hidden">
				<div className="border-b border-white/10 px-5 py-5 sm:px-6">
					<div className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-100/70">
						{selectedSeason?.year ?? 'Celkově'} {getSeasonDescriptor(selectedSeason)}
					</div>
				</div>

				<div className="grid gap-px bg-white/10 lg:grid-cols-3">
					<article className="bg-slate-950/40 p-5 sm:p-6">
						<div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/70">Zápasy</div>
						<div className="mt-4 overflow-x-auto">
							<table className="min-w-full text-left text-sm text-slate-200">
								<thead className="text-xs uppercase tracking-[0.18em] text-slate-400">
									<tr>
										<th className="pb-3 pr-4 font-medium" title="Počet zápasů">Z</th>
										<th className="pb-3 pr-4 font-medium" title="Výhry">V</th>
										<th className="pb-3 pr-4 font-medium" title="Výhry po prodloužení nebo nájezdech">VP</th>
										<th className="pb-3 pr-4 font-medium" title="Remízy">R</th>
										<th className="pb-3 pr-4 font-medium" title="Prohry po prodloužení nebo nájezdech">PP</th>
										<th className="pb-3 pr-4 font-medium" title="Prohry">P</th>
										<th className="pb-3 pr-4 font-medium" title="Body">B</th>
										<th className="pb-3 pr-4 font-medium" title="Branky vstřelené">BV</th>
										<th className="pb-3 pr-4 font-medium" title="Branky obdržené">BO</th>
										<th className="pb-3 font-medium" title="Brankový rozdíl">BR</th>
									</tr>
								</thead>
								<tbody>
									<tr className="border-t border-white/10 text-white">
											<td className="py-3 pr-4">{overview?.matches ?? 0}</td>
											<td className="py-3 pr-4">{overview?.wins ?? 0}</td>
											<td className="py-3 pr-4">{overview?.overtimeWins ?? 0}</td>
											<td className="py-3 pr-4">{overview?.draws ?? 0}</td>
											<td className="py-3 pr-4">{overview?.overtimeLosses ?? 0}</td>
											<td className="py-3 pr-4">{overview?.losses ?? 0}</td>
											<td className="py-3 pr-4">{overview?.points ?? 0}</td>
											<td className="py-3 pr-4">{overview?.goalsFor ?? 0}</td>
											<td className="py-3 pr-4">{overview?.goalsAgainst ?? 0}</td>
											<td className="py-3">{overview?.goalDiff ?? 0}</td>
									</tr>
								</tbody>
							</table>
						</div>
					</article>

					<article className="bg-slate-950/40 p-5 sm:p-6">
						<div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/70">Přesilovky</div>
						<div className="mt-4 overflow-x-auto">
							<table className="min-w-full text-left text-sm text-slate-200">
								<thead className="text-xs uppercase tracking-[0.18em] text-slate-400">
									<tr>
										<th className="pb-3 pr-4 font-medium" title="Počet přesilovek">Počet</th>
										<th className="pb-3 pr-4 font-medium" title="Branky vstřelené v přesilovkách">BV</th>
										<th className="pb-3 pr-4 font-medium" title="Úspěšnost využití přesilovek v procentech">%</th>
										<th className="pb-3 font-medium" title="Branky obdržené během vlastní přesilovky">BO</th>
									</tr>
								</thead>
								<tbody>
									<tr className="border-t border-white/10 text-white">
											<td className="py-3 pr-4">{overview?.powerPlayOpportunities ?? 0}</td>
											<td className="py-3 pr-4">{overview?.powerPlayGoals ?? 0}</td>
											<td className="py-3 pr-4">{formatPercent(overview?.powerPlayEfficiency ?? 0)}</td>
											<td className="py-3">{overview?.powerPlayGoalsAgainst ?? 0}</td>
									</tr>
								</tbody>
							</table>
						</div>
					</article>

					<article className="bg-slate-950/40 p-5 sm:p-6">
						<div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/70">Oslabení</div>
						<div className="mt-4 overflow-x-auto">
							<table className="min-w-full text-left text-sm text-slate-200">
								<thead className="text-xs uppercase tracking-[0.18em] text-slate-400">
									<tr>
										<th className="pb-3 pr-4 font-medium" title="Počet oslabení">Počet</th>
										<th className="pb-3 pr-4 font-medium" title="Branky obdržené v oslabení">BO</th>
										<th className="pb-3 pr-4 font-medium" title="Úspěšnost ubránění oslabení v procentech">%</th>
										<th className="pb-3 font-medium" title="Branky vstřelené v oslabení">BV</th>
									</tr>
								</thead>
								<tbody>
									<tr className="border-t border-white/10 text-white">
											<td className="py-3 pr-4">{overview?.penaltyKillOpportunities ?? 0}</td>
											<td className="py-3 pr-4">{overview?.penaltyKillGoalsAgainst ?? 0}</td>
											<td className="py-3 pr-4">{formatPercent(overview?.penaltyKillEfficiency ?? 0)}</td>
											<td className="py-3">{overview?.shorthandedGoals ?? 0}</td>
									</tr>
								</tbody>
							</table>
						</div>
					</article>
				</div>
			</section>

			<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<article className="panel-soft p-5">
					<div className="text-xs uppercase tracking-[0.24em] text-slate-400">Bilance</div>
					<div className="mt-3 text-3xl font-bold text-white">
						{overview.wins}-{overview.draws}-{overview.losses}
					</div>
					<div className="mt-2 text-sm text-slate-300">Základní přehled výsledků ve vybraném bloku</div>
				</article>
				<article className="panel-soft p-5">
					<div className="text-xs uppercase tracking-[0.24em] text-slate-400">Body</div>
					<div className="mt-3 text-3xl font-bold text-cyan-100">{overview.points}</div>
					<div className="mt-2 text-sm text-slate-300">Součet bodů ze všech vybraných zápasů</div>
				</article>
				<article className="panel-soft p-5">
					<div className="text-xs uppercase tracking-[0.24em] text-slate-400">Skóre</div>
					<div className="mt-3 text-3xl font-bold text-white">{overview.goalsFor}:{overview.goalsAgainst}</div>
					<div className="mt-2 text-sm text-slate-300">BV a BO přepočtené z vybraných utkání</div>
				</article>
				<article className="panel-soft p-5">
					<div className="text-xs uppercase tracking-[0.24em] text-slate-400">Speciální týmy</div>
					<div className="mt-3 text-3xl font-bold text-white">{formatPercent(overview.powerPlayEfficiency)}%</div>
					<div className="mt-2 text-sm text-slate-300">Využití přesilovek, ubránění oslabení {formatPercent(overview.penaltyKillEfficiency)}%</div>
				</article>
			</section>
		</div>
	);
};