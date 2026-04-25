import { useEffect, useMemo, useState } from 'react';
import { ScopeTabs, type TeamScope } from '@components/UI/ScopeTabs';
import { getMatches, getSeasons } from '@utils/api';
import { filterMatchesByScope, scopeLabel } from '@utils/statistics';
import type { Match } from '@models/match';
import type { Season } from '@models/season';

interface OverallSeasonStats {
	matches: number;
	wins: number;
	overtimeWins: number;
	draws: number;
	overtimeLosses: number;
	losses: number;
	points: number;
	goalsFor: number;
	goalsAgainst: number;
	goalDiff: number;
	powerPlayOpportunities: number;
	powerPlayGoals: number;
	powerPlayEfficiency: number;
	powerPlayGoalsAgainst: number;
	penaltyKillOpportunities: number;
	penaltyKillGoalsAgainst: number;
	penaltyKillEfficiency: number;
	shorthandedGoals: number;
}

const formatPercent = (value: number) => value.toFixed(2).replace('.', ',');

const getSeasonDescriptor = (season: Season | undefined) => {
	if (!season) {
		return 'Celkové statistiky';
	}

	if (season.covidInterrupted) {
		return season.position ? `${season.position}. místo - nedohráno (COVID)` : 'Nedohráno (COVID)';
	}

	return season.position ? `${season.position}. místo` : season.leagueName;
};

const buildOverallSeasonStats = (matches: Match[]): OverallSeasonStats => {
	const wins = matches.filter((match) => match.result === 'W').length;
	const draws = matches.filter((match) => match.result === 'D').length;
	const losses = matches.filter((match) => match.result === 'L').length;
	const goalsFor = matches.reduce((total, match) => total + match.ourScore, 0);
	const goalsAgainst = matches.reduce((total, match) => total + match.opponentScore, 0);
	const powerPlayOpportunities = matches.reduce(
		(total, match) => total + match.penalties.filter((penalty) => !penalty.ourTeam).length,
		0,
	);
	const powerPlayGoals = matches.reduce(
		(total, match) => total + match.goals.filter((goal) => goal.ourTeam && goal.type === 'power play').length,
		0,
	);
	const powerPlayGoalsAgainst = matches.reduce(
		(total, match) => total + match.goals.filter((goal) => !goal.ourTeam && goal.type === 'shorthanded').length,
		0,
	);
	const penaltyKillOpportunities = matches.reduce(
		(total, match) => total + match.penalties.filter((penalty) => penalty.ourTeam).length,
		0,
	);
	const penaltyKillGoalsAgainst = matches.reduce(
		(total, match) => total + match.goals.filter((goal) => !goal.ourTeam && goal.type === 'power play').length,
		0,
	);
	const shorthandedGoals = matches.reduce(
		(total, match) => total + match.goals.filter((goal) => goal.ourTeam && goal.type === 'shorthanded').length,
		0,
	);

	return {
		matches: matches.length,
		wins,
		overtimeWins: 0,
		draws,
		overtimeLosses: 0,
		losses,
		points: wins * 3 + draws,
		goalsFor,
		goalsAgainst,
		goalDiff: goalsFor - goalsAgainst,
		powerPlayOpportunities,
		powerPlayGoals,
		powerPlayEfficiency: powerPlayOpportunities > 0 ? (powerPlayGoals / powerPlayOpportunities) * 100 : 0,
		powerPlayGoalsAgainst,
		penaltyKillOpportunities,
		penaltyKillGoalsAgainst,
		penaltyKillEfficiency:
			penaltyKillOpportunities > 0 ? ((penaltyKillOpportunities - penaltyKillGoalsAgainst) / penaltyKillOpportunities) * 100 : 0,
		shorthandedGoals,
	};
};

export const OverviewPage = () => {
	const [matches, setMatches] = useState<Match[]>([]);
	const [seasons, setSeasons] = useState<Season[]>([]);
	const [scope, setScope] = useState<TeamScope>('ALL');
	const [seasonId, setSeasonId] = useState('ALL');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const load = async () => {
			const [nextMatches, nextSeasons] = await Promise.all([getMatches(), getSeasons()]);
			setMatches(nextMatches);
			setSeasons(nextSeasons);
			setLoading(false);
		};

		void load();
	}, []);

	const seasonOptions = useMemo(
		() => [...seasons].sort((left, right) => right.year.localeCompare(left.year, 'cs')),
		[seasons],
	);
	const selectedSeason = seasonOptions.find((season) => season.id === seasonId);
	const filteredMatches = useMemo(() => {
		const scopedMatches = filterMatchesByScope(matches, scope);
		return seasonId === 'ALL' ? scopedMatches : scopedMatches.filter((match) => match.seasonId === seasonId);
	}, [matches, scope, seasonId]);
	const overview = useMemo(() => buildOverallSeasonStats(filteredMatches), [filteredMatches]);

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
										<th className="pb-3 pr-4 font-medium">&nbsp;</th>
										<th className="pb-3 pr-4 font-medium">Z</th>
										<th className="pb-3 pr-4 font-medium">V</th>
										<th className="pb-3 pr-4 font-medium">VP</th>
										<th className="pb-3 pr-4 font-medium">R</th>
										<th className="pb-3 pr-4 font-medium">PP</th>
										<th className="pb-3 pr-4 font-medium">P</th>
										<th className="pb-3 pr-4 font-medium">B</th>
										<th className="pb-3 pr-4 font-medium">BV</th>
										<th className="pb-3 pr-4 font-medium">BO</th>
										<th className="pb-3 font-medium">BR</th>
									</tr>
								</thead>
								<tbody>
									<tr className="border-t border-white/10 text-white">
										<th className="py-3 pr-4 font-semibold">Zápasy</th>
										<td className="py-3 pr-4">{overview.matches}</td>
										<td className="py-3 pr-4">{overview.wins}</td>
										<td className="py-3 pr-4">{overview.overtimeWins}</td>
										<td className="py-3 pr-4">{overview.draws}</td>
										<td className="py-3 pr-4">{overview.overtimeLosses}</td>
										<td className="py-3 pr-4">{overview.losses}</td>
										<td className="py-3 pr-4">{overview.points}</td>
										<td className="py-3 pr-4">{overview.goalsFor}</td>
										<td className="py-3 pr-4">{overview.goalsAgainst}</td>
										<td className="py-3">{overview.goalDiff}</td>
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
										<th className="pb-3 pr-4 font-medium">&nbsp;</th>
										<th className="pb-3 pr-4 font-medium">Počet přesilovek</th>
										<th className="pb-3 pr-4 font-medium">Góly</th>
										<th className="pb-3 pr-4 font-medium">% Využití</th>
										<th className="pb-3 font-medium">Inkasované góly</th>
									</tr>
								</thead>
								<tbody>
									<tr className="border-t border-white/10 text-white">
										<th className="py-3 pr-4 font-semibold">Přesilovky</th>
										<td className="py-3 pr-4">{overview.powerPlayOpportunities}</td>
										<td className="py-3 pr-4">{overview.powerPlayGoals}</td>
										<td className="py-3 pr-4">{formatPercent(overview.powerPlayEfficiency)}</td>
										<td className="py-3">{overview.powerPlayGoalsAgainst}</td>
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
										<th className="pb-3 pr-4 font-medium">&nbsp;</th>
										<th className="pb-3 pr-4 font-medium">Počet oslabení</th>
										<th className="pb-3 pr-4 font-medium">Inkasované góly</th>
										<th className="pb-3 pr-4 font-medium">% Ubráněná oslabení</th>
										<th className="pb-3 font-medium">Góly v oslabení</th>
									</tr>
								</thead>
								<tbody>
									<tr className="border-t border-white/10 text-white">
										<th className="py-3 pr-4 font-semibold">Oslabení</th>
										<td className="py-3 pr-4">{overview.penaltyKillOpportunities}</td>
										<td className="py-3 pr-4">{overview.penaltyKillGoalsAgainst}</td>
										<td className="py-3 pr-4">{formatPercent(overview.penaltyKillEfficiency)}</td>
										<td className="py-3">{overview.shorthandedGoals}</td>
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