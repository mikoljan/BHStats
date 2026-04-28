import type { TeamScope } from '@components/UI/ScopeTabs';

export type RecordBookIconName = 'zap' | 'sparkles' | 'medal' | 'star' | 'clock';

export interface RecordBookRow {
  id: string;
  playerName?: string;
  goals?: number | string;
  assists?: number | string;
  points?: number | string;
  count?: number | string;
  matches?: number | string;
  season?: string;
  opponent?: string;
  time?: string;
  date?: string;
  period?: string;
  [key: string]: string | number | undefined;
}

export interface RecordBookColumn {
  key: string;
  header: string;
  className?: string;
}

export interface RecordBookTable {
  key: string;
  eyebrow: string;
  title: string;
  caption: string;
  accentClassName: string;
  iconName: RecordBookIconName;
  columns: RecordBookColumn[];
  rows: RecordBookRow[];
}

export interface RecordBookSection {
  key: string;
  eyebrow: string;
  title: string;
  description: string;
  gridClassName: string;
  tables: RecordBookTable[];
}

export const recordHeroStats: Record<TeamScope, Array<{ label: string; value: string; note: string }>> = {
  A: [
    { label: 'Top PP body', value: '30', note: 'Stanislav Prokop' },
    { label: 'Top SH body', value: '19', note: 'Stanislav Prokop' },
    { label: 'Nejvíc hattricků', value: '39', note: 'Stanislav Prokop' },
  ],
  B: [
    { label: 'Detail rekordů', value: 'A', note: 'Zapsáno podle dodaného výřezu' },
    { label: 'Další scope', value: 'brzy', note: 'B rekordy zatím nejsou rozepsané' },
    { label: 'Status', value: 'draft', note: 'Layout je připravený i pro další data' },
  ],
  C: [
    { label: 'Detail rekordů', value: 'A', note: 'Zapsáno podle dodaného výřezu' },
    { label: 'Další scope', value: 'brzy', note: 'C rekordy zatím nejsou rozepsané' },
    { label: 'Status', value: 'draft', note: 'Layout je připravený i pro další data' },
  ],
  ALL: [
    { label: 'Detail rekordů', value: 'A', note: 'Zapsáno podle dodaného výřezu' },
    { label: 'Další scope', value: 'brzy', note: 'Souhrn A+B+C zatím není rozepsaný' },
    { label: 'Status', value: 'draft', note: 'Layout je připravený i pro další data' },
  ],
};

const powerPlayPoints: RecordBookRow[] = [
  { id: 'pp-1', playerName: 'Stanislav Prokop', goals: 19, assists: 11, points: 30 },
  { id: 'pp-2', playerName: 'Pavel Pulec', goals: 12, assists: 9, points: 21 },
  { id: 'pp-3', playerName: 'Jiří Polívka', goals: 12, assists: 7, points: 19 },
  { id: 'pp-4', playerName: 'Tomáš Pichner', goals: 12, assists: 4, points: 16 },
  { id: 'pp-5', playerName: 'Jakub Hříbal', goals: 4, assists: 11, points: 15 },
  { id: 'pp-6', playerName: 'Tomáš Leipner', goals: 6, assists: 5, points: 11 },
  { id: 'pp-7', playerName: 'Jaroslav Macík', goals: 7, assists: 3, points: 10 },
  { id: 'pp-8', playerName: 'Filip Švojgr', goals: 5, assists: 5, points: 10 },
  { id: 'pp-9', playerName: 'Jakub Drexler', goals: 3, assists: 7, points: 10 },
  { id: 'pp-10', playerName: 'František Štiller', goals: 2, assists: 7, points: 9 },
  { id: 'pp-11', playerName: 'Jiří Leisch', goals: 3, assists: 4, points: 7 },
  { id: 'pp-12', playerName: 'Robert Hahn', goals: 4, assists: 2, points: 6 },
  { id: 'pp-13', playerName: 'Lukáš Koubek', goals: 4, assists: 2, points: 6 },
  { id: 'pp-14', playerName: 'Zdeněk Husák', goals: 0, assists: 6, points: 6 },
  { id: 'pp-15', playerName: 'Tomáš Husarik', goals: 3, assists: 1, points: 4 },
  { id: 'pp-16', playerName: 'Ondřej Husák', goals: 3, assists: 1, points: 4 },
  { id: 'pp-17', playerName: 'Stanislav Bořek', goals: 2, assists: 2, points: 4 },
  { id: 'pp-18', playerName: 'Michal Čermák', goals: 1, assists: 2, points: 3 },
  { id: 'pp-19', playerName: 'Jan Mikolášek', goals: 0, assists: 2, points: 2 },
  { id: 'pp-20', playerName: 'Miroslav Příhoda', goals: 1, assists: 0, points: 1 },
  { id: 'pp-21', playerName: 'Marek Vesecký', goals: 1, assists: 0, points: 1 },
  { id: 'pp-22', playerName: 'David Ondrejička', goals: 1, assists: 0, points: 1 },
  { id: 'pp-23', playerName: 'Lukáš Zbránek', goals: 0, assists: 1, points: 1 },
  { id: 'pp-24', playerName: 'Kamil Bašta', goals: 0, assists: 1, points: 1 },
  { id: 'pp-25', playerName: 'David Homér', goals: 0, assists: 1, points: 1 },
  { id: 'pp-26', playerName: 'Tomáš Kaleta', goals: 0, assists: 1, points: 1 },
];

const shorthandedPoints: RecordBookRow[] = [
  { id: 'sh-1', playerName: 'Stanislav Prokop', goals: 16, assists: 3, points: 19 },
  { id: 'sh-2', playerName: 'Jiří Polívka', goals: 8, assists: 4, points: 12 },
  { id: 'sh-3', playerName: 'Jakub Hříbal', goals: 7, assists: 4, points: 11 },
  { id: 'sh-4', playerName: 'Jakub Drexler', goals: 5, assists: 5, points: 10 },
  { id: 'sh-5', playerName: 'Jiří Leisch', goals: 3, assists: 5, points: 8 },
  { id: 'sh-6', playerName: 'Filip Švojgr', goals: 3, assists: 2, points: 5 },
  { id: 'sh-7', playerName: 'František Štiller', goals: 1, assists: 4, points: 5 },
  { id: 'sh-8', playerName: 'Tomáš Leipner', goals: 4, assists: 0, points: 4 },
  { id: 'sh-9', playerName: 'Zdeněk Husák', goals: 3, assists: 1, points: 4 },
  { id: 'sh-10', playerName: 'Ondřej Husák', goals: 2, assists: 1, points: 3 },
  { id: 'sh-11', playerName: 'Pavel Pulec', goals: 2, assists: 0, points: 2 },
  { id: 'sh-12', playerName: 'Jaroslav Macík', goals: 1, assists: 1, points: 2 },
  { id: 'sh-13', playerName: 'Tomáš Prchal', goals: 1, assists: 1, points: 2 },
  { id: 'sh-14', playerName: 'Jan Mikolášek', goals: 0, assists: 2, points: 2 },
  { id: 'sh-15', playerName: 'Tomáš Husarik', goals: 0, assists: 2, points: 2 },
  { id: 'sh-16', playerName: 'Robert Hahn', goals: 1, assists: 0, points: 1 },
  { id: 'sh-17', playerName: 'Petr Heller', goals: 1, assists: 0, points: 1 },
  { id: 'sh-18', playerName: 'Miroslav Příhoda', goals: 0, assists: 1, points: 1 },
  { id: 'sh-19', playerName: 'Kamil Bašta', goals: 0, assists: 1, points: 1 },
  { id: 'sh-20', playerName: 'David Ondrejička', goals: 0, assists: 1, points: 1 },
  { id: 'sh-21', playerName: 'Tomáš Šebesta', goals: 0, assists: 1, points: 1 },
  { id: 'sh-22', playerName: 'Lukáš Zbránek', goals: 0, assists: 1, points: 1 },
  { id: 'sh-23', playerName: 'David Homér', goals: 0, assists: 1, points: 1 },
  { id: 'sh-24', playerName: 'Martin Šula', goals: 0, assists: 1, points: 1 },
];

const hattricks: RecordBookRow[] = [
  { id: 'hat-1', playerName: 'Stanislav Prokop', count: 39 },
  { id: 'hat-2', playerName: 'Jiří Polívka', count: 24 },
  { id: 'hat-3', playerName: 'Tomáš Leipner', count: 11 },
  { id: 'hat-4', playerName: 'Tomáš Pichner', count: 10 },
  { id: 'hat-5', playerName: 'Jakub Drexler', count: 6 },
  { id: 'hat-6', playerName: 'Jakub Hříbal', count: 6 },
  { id: 'hat-7', playerName: 'Zdeněk Husák', count: 6 },
  { id: 'hat-8', playerName: 'Jaroslav Macík', count: 5 },
  { id: 'hat-9', playerName: 'Robert Hahn', count: 3 },
  { id: 'hat-10', playerName: 'Pavel Pulec', count: 3 },
  { id: 'hat-11', playerName: 'Ondřej Husák', count: 3 },
  { id: 'hat-12', playerName: 'Lukáš Koubek', count: 2 },
  { id: 'hat-13', playerName: 'Filip Švojgr', count: 1 },
  { id: 'hat-14', playerName: 'David Homér', count: 1 },
  { id: 'hat-15', playerName: 'Kamil Bašta', count: 1 },
  { id: 'hat-16', playerName: 'Tomáš Sochor', count: 1 },
  { id: 'hat-17', playerName: 'Tomáš Prchal', count: 1 },
];

const fourGoalGames: RecordBookRow[] = [
  { id: 'g4-1', playerName: 'Stanislav Prokop', count: 13 },
  { id: 'g4-2', playerName: 'Tomáš Leipner', count: 5 },
  { id: 'g4-3', playerName: 'Jiří Polívka', count: 3 },
  { id: 'g4-4', playerName: 'Jaroslav Macík', count: 3 },
  { id: 'g4-5', playerName: 'Zdeněk Husák', count: 2 },
  { id: 'g4-6', playerName: 'Jakub Hříbal', count: 1 },
  { id: 'g4-7', playerName: 'Robert Hahn', count: 1 },
  { id: 'g4-8', playerName: 'Pavel Pulec', count: 1 },
  { id: 'g4-9', playerName: 'Tomáš Prchal', count: 1 },
  { id: 'g4-10', playerName: 'Ondřej Husák', count: 1 },
];

const fiveGoalGames: RecordBookRow[] = [
  { id: 'g5-1', playerName: 'Stanislav Prokop', count: 4 },
  { id: 'g5-2', playerName: 'Robert Hahn', count: 1 },
  { id: 'g5-3', playerName: 'Jiří Polívka', count: 1 },
  { id: 'g5-4', playerName: 'Tomáš Leipner', count: 1 },
  { id: 'g5-5', playerName: 'Pavel Pulec', count: 1 },
];

const sixGoalGames: RecordBookRow[] = [
  { id: 'g6-1', playerName: 'Jiří Polívka', count: 1 },
  { id: 'g6-2', playerName: 'Stanislav Prokop', count: 1 },
];

const pointsInOneGame: RecordBookRow[] = [
  { id: 'p1g-1', playerName: 'Stanislav Prokop', goals: 6, assists: 2, points: 8, season: '2018/2019', opponent: 'FBC Falcons Žižkov (12:5)' },
  { id: 'p1g-2', playerName: 'Robert Hahn', goals: 5, assists: 3, points: 8, season: '2013/2014', opponent: 'SK B.U.H. Praha B (11:2)' },
  { id: 'p1g-3', playerName: 'Tomáš Leipner', goals: 4, assists: 4, points: 8, season: '2019/2020', opponent: 'Florbal Praha (11:3)' },
  { id: 'p1g-4', playerName: 'Stanislav Prokop', goals: 5, assists: 2, points: 7, season: '2014/2015', opponent: 'FBC Vokovický Šavle (10:2)' },
  { id: 'p1g-5', playerName: 'Jiří Polívka', goals: 4, assists: 3, points: 7, season: '2013/2014', opponent: 'TBC Horoměřice B (12:4)' },
  { id: 'p1g-6', playerName: 'Zdeněk Husák', goals: 4, assists: 3, points: 7, season: '2023/2024', opponent: 'FKÚ Ovocné Báze (10:4)' },
  { id: 'p1g-7', playerName: 'Kamil Bašta', goals: 2, assists: 5, points: 7, season: '2016/2017', opponent: 'IBK Kubánský Klan B (10:8)' },
  { id: 'p1g-8', playerName: 'Jiří Polívka', goals: 6, assists: 0, points: 6, season: '2017/2018', opponent: 'FbŠ Bohemians C (7:9)' },
  { id: 'p1g-9', playerName: 'Stanislav Prokop', goals: 5, assists: 1, points: 6, season: '2021/2022', opponent: 'IBK Kubánský Klan B (13:4)' },
  { id: 'p1g-10', playerName: 'Stanislav Prokop', goals: 5, assists: 1, points: 6, season: '2016/2017', opponent: 'Sport Eden Beroun (12:2)' },
  { id: 'p1g-11', playerName: 'Pavel Pulec', goals: 5, assists: 1, points: 6, season: '2022/2023', opponent: 'Kralupy Wolves B (15:4)' },
  { id: 'p1g-12', playerName: 'Stanislav Prokop', goals: 4, assists: 2, points: 6, season: '2016/2017', opponent: 'IBK Kubánský Klan B (15:3)' },
  { id: 'p1g-13', playerName: 'Jiří Polívka', goals: 4, assists: 2, points: 6, season: '2015/2016', opponent: 'Šneci z Pěšin (9:4)' },
  { id: 'p1g-14', playerName: 'Tomáš Leipner', goals: 4, assists: 2, points: 6, season: '2019/2020', opponent: 'T.B.C. Králův Dvůr (10:3)' },
  { id: 'p1g-15', playerName: 'Tomáš Leipner', goals: 4, assists: 2, points: 6, season: '2022/2023', opponent: 'Prague Tigers B (12:3)' },
  { id: 'p1g-16', playerName: 'Jakub Drexler', goals: 3, assists: 3, points: 6, season: '2022/2023', opponent: 'Las Plantas (12:11n)' },
  { id: 'p1g-17', playerName: 'Tomáš Leipner', goals: 3, assists: 3, points: 6, season: '2023/2024', opponent: 'Orka Čelákovice B (11:4)' },
  { id: 'p1g-18', playerName: 'Stanislav Prokop', goals: 2, assists: 4, points: 6, season: '2021/2022', opponent: 'Game Over Praha (10:1)' },
  { id: 'p1g-19', playerName: 'Tomáš Leipner', goals: 2, assists: 4, points: 6, season: '2022/2023', opponent: 'FBC Slavia Praha B (13:6)' },
  { id: 'p1g-20', playerName: 'Stanislav Prokop', goals: 2, assists: 4, points: 6, season: '2022/2023', opponent: 'Kralupy Wolves B (15:4)' },
];

const pointsInSeason: RecordBookRow[] = [
  { id: 'pis-1', playerName: 'Stanislav Prokop', matches: 24, goals: 46, assists: 23, points: 69, season: '2016/2017' },
  { id: 'pis-2', playerName: 'Zdeněk Husák', matches: 24, goals: 32, assists: 25, points: 57, season: '2023/2024' },
  { id: 'pis-3', playerName: 'Stanislav Prokop', matches: 18, goals: 32, assists: 22, points: 54, season: '2015/2016' },
  { id: 'pis-4', playerName: 'Stanislav Prokop', matches: 20, goals: 28, assists: 26, points: 54, season: '2014/2015' },
  { id: 'pis-5', playerName: 'Stanislav Prokop', matches: 20, goals: 38, assists: 15, points: 53, season: '2021/2022' },
  { id: 'pis-6', playerName: 'Stanislav Prokop', matches: 24, goals: 34, assists: 15, points: 53, season: '2017/2018' },
  { id: 'pis-7', playerName: 'Jiří Polívka', matches: 22, goals: 31, assists: 20, points: 51, season: '2016/2017' },
  { id: 'pis-8', playerName: 'Stanislav Prokop', matches: 19, goals: 31, assists: 19, points: 50, season: '2022/2023' },
  { id: 'pis-9', playerName: 'Tomáš Leipner', matches: 14, goals: 27, assists: 17, points: 44, season: '2019/2020' },
  { id: 'pis-10', playerName: 'Jiří Polívka', matches: 23, goals: 24, assists: 20, points: 44, season: '2022/2023' },
];

const assistsInSeason: RecordBookRow[] = [
  { id: 'ais-1', playerName: 'Jakub Drexler', matches: 19, assists: 26, season: '2021/2022' },
  { id: 'ais-2', playerName: 'Stanislav Prokop', matches: 20, assists: 26, season: '2014/2015' },
  { id: 'ais-3', playerName: 'Zdeněk Husák', matches: 24, assists: 25, season: '2023/2024' },
  { id: 'ais-4', playerName: 'Stanislav Prokop', matches: 24, assists: 23, season: '2016/2017' },
  { id: 'ais-5', playerName: 'Stanislav Prokop', matches: 18, assists: 22, season: '2015/2016' },
  { id: 'ais-6', playerName: 'Jakub Drexler', matches: 21, assists: 22, season: '2022/2023' },
  { id: 'ais-7', playerName: 'Jiří Polívka', matches: 22, assists: 20, season: '2016/2017' },
  { id: 'ais-8', playerName: 'Jiří Polívka', matches: 22, assists: 20, season: '2023/2024' },
  { id: 'ais-9', playerName: 'Jiří Polívka', matches: 23, assists: 20, season: '2022/2023' },
  { id: 'ais-10', playerName: 'Jakub Drexler', matches: 18, assists: 19, season: '2017/2018' },
  { id: 'ais-11', playerName: 'Stanislav Prokop', matches: 19, assists: 19, season: '2022/2023' },
  { id: 'ais-12', playerName: 'Robert Hahn', matches: 20, assists: 19, season: '2012/2013' },
];

const goalsInSeason: RecordBookRow[] = [
  { id: 'gis-1', playerName: 'Stanislav Prokop', matches: 24, goals: 46, season: '2016/2017' },
  { id: 'gis-2', playerName: 'Stanislav Prokop', matches: 20, goals: 38, season: '2021/2022' },
  { id: 'gis-3', playerName: 'Stanislav Prokop', matches: 24, goals: 38, season: '2017/2018' },
  { id: 'gis-4', playerName: 'Stanislav Prokop', matches: 18, goals: 32, season: '2015/2016' },
  { id: 'gis-5', playerName: 'Zdeněk Husák', matches: 22, goals: 32, season: '2023/2024' },
  { id: 'gis-6', playerName: 'Stanislav Prokop', matches: 19, goals: 31, season: '2022/2023' },
  { id: 'gis-7', playerName: 'Stanislav Prokop', matches: 20, goals: 28, season: '2014/2015' },
  { id: 'gis-8', playerName: 'Tomáš Leipner', matches: 14, goals: 27, season: '2019/2020' },
  { id: 'gis-9', playerName: 'Stanislav Prokop', matches: 14, goals: 25, season: '2019/2020' },
  { id: 'gis-10', playerName: 'Jiří Polívka', matches: 16, goals: 25, season: '2015/2016' },
  { id: 'gis-11', playerName: 'Jiří Polívka', matches: 19, goals: 25, season: '2014/2015' },
];

const quickestGoal: RecordBookRow[] = [
  { id: 'qg-1', playerName: 'Stanislav Prokop', time: '0:03', date: '25.09.2016', opponent: 'FbK Olymp Praha B (7:2)' },
  { id: 'qg-2', playerName: 'Tomáš Leipner', time: '0:03', date: '20.04.2024', opponent: 'Orka Čelákovice B (7:5)' },
  { id: 'qg-3', playerName: 'Stanislav Prokop', time: '0:04', date: '30.04.2023', opponent: 'Las Plantas (12:11n)' },
  { id: 'qg-4', playerName: 'Stanislav Prokop', time: '0:07', date: '27.02.2016', opponent: 'SK Black Dragons (9:3)' },
  { id: 'qg-5', playerName: 'Jakub Drexler', time: '0:09', date: '20.11.2021', opponent: 'IBK Kubánský Klan B (13:4)' },
  { id: 'qg-6', playerName: 'Stanislav Prokop', time: '0:12', date: '03.12.2017', opponent: 'FbC Barracudas Slaný (7:9)' },
  { id: 'qg-7', playerName: 'Stanislav Prokop', time: '0:12', date: '07.01.2018', opponent: 'Tatran Střešovice B (6:4)' },
  { id: 'qg-8', playerName: 'Stanislav Prokop', time: '0:13', date: '10.04.2022', opponent: 'IBK Svatý Hole Kladno (5:4)' },
  { id: 'qg-9', playerName: 'Robert Hahn', time: '0:13', date: '02.11.2013', opponent: 'Noxa Ruzyně (3:7)' },
  { id: 'qg-10', playerName: 'Tomáš Leipner', time: '0:14', date: '24.03.2022', opponent: 'Torza Sorry ASI (10:4)' },
];

const quickestHattrick: RecordBookRow[] = [
  { id: 'qh-1', playerName: 'Jakub Drexler', time: '10:31', date: '10.02.2019', opponent: 'Kanonýři Kladno C (6:8)' },
  { id: 'qh-2', playerName: 'Jakub Drexler', time: '12:24', date: '10.10.2020', opponent: 'FBC Engineers (6:2)' },
  { id: 'qh-3', playerName: 'Stanislav Prokop', time: '12:32', date: '01.04.2023', opponent: 'IBK Kubánský Klan (11:8)' },
  { id: 'qh-4', playerName: 'Lukáš Koubek', time: '15:07', date: '15.03.2014', opponent: 'SK Lators (11:0)' },
  { id: 'qh-5', playerName: 'Tomáš Leipner', time: '15:18', date: '09.02.2020', opponent: 'FBC Engineers (14:1)' },
  { id: 'qh-6', playerName: 'Stanislav Prokop', time: '16:01', date: '02.03.2019', opponent: 'FBC Falcons Žižkov (12:5)' },
  { id: 'qh-7', playerName: 'Stanislav Prokop', time: '16:19', date: '30.04.2023', opponent: 'Las Plantas (12:11n)' },
  { id: 'qh-8', playerName: 'Jakub Hříbal', time: '16:21', date: '15.01.2017', opponent: 'Sport Eden Beroun (11:5)' },
  { id: 'qh-9', playerName: 'Robert Hahn', time: '16:22', date: '01.12.2013', opponent: 'SK B.U.H. Praha B (11:2)' },
  { id: 'qh-10', playerName: 'Jaroslav Macík', time: '17:20', date: '29.01.2023', opponent: 'FBC Slavia Praha B (13:6)' },
];

const longestNoGoalStreak: RecordBookRow[] = [
  { id: 'lng-1', playerName: 'Lukáš Zbránek', time: '73:33', period: '20.11.2021 - 05.12.2021' },
  { id: 'lng-2', playerName: 'Lukáš Zbránek', time: '68:28', period: '15.03.2014 - 13.04.2014' },
  { id: 'lng-3', playerName: 'Lukáš Zbránek', time: '68:22', period: '02.03.2013 - 16.03.2013' },
  { id: 'lng-4', playerName: 'Lukáš Zbránek', time: '65:29', period: '17.11.2014 - 13.12.2014' },
  { id: 'lng-5', playerName: 'Lukáš Zbránek', time: '64:13', period: '01.10.2023 - 14.10.2023' },
  { id: 'lng-6', playerName: 'Miroslav Křenek', time: '57:21', period: '19.03.2022 - 19.02.2023' },
  { id: 'lng-7', playerName: 'Lukáš Zbránek', time: '57:17', period: '19.09.2021 - 09.10.2021' },
  { id: 'lng-8', playerName: 'Lukáš Zbránek', time: '56:43', period: '05.12.2021 - 08.01.2022' },
  { id: 'lng-9', playerName: 'Lukáš Zbránek', time: '52:51', period: '09.03.2024 - 23.03.2024' },
  { id: 'lng-10', playerName: 'Lukáš Zbránek', time: '50:33', period: '04.11.2012 - 10.11.2012' },
  { id: 'lng-11', playerName: 'Lukáš Zbránek', time: '50:33', period: '27.01.2024' },
];

const longestWinningStreak: RecordBookRow[] = [
  { id: 'lws-1', playerName: 'Lukáš Zbránek', count: 19, period: '19.09.2021 - 17.09.2022' },
  { id: 'lws-2', playerName: 'Lukáš Zbránek', count: 8, period: '25.10.2015 - 27.02.2016' },
  { id: 'lws-3', playerName: 'Lukáš Zbránek', count: 8, period: '19.03.2016 - 25.09.2017' },
  { id: 'lws-4', playerName: 'Lukáš Zbránek', count: 7, period: '08.02.2014 - 13.04.2014' },
  { id: 'lws-5', playerName: 'Lukáš Zbránek', count: 6, period: '27.10.2019 - 18.01.2020' },
  { id: 'lws-6', playerName: 'Lukáš Zbránek', count: 6, period: '09.10.2022 - 20.11.2022' },
  { id: 'lws-7', playerName: 'Lukáš Zbránek', count: 6, period: '01.04.2023 - 18.11.2023' },
  { id: 'lws-8', playerName: 'Lukáš Zbránek', count: 5, period: '02.03.2013 - 07.04.2013' },
  { id: 'lws-9', playerName: 'Lukáš Zbránek', count: 5, period: '10.12.2023 - 27.01.2024' },
  { id: 'lws-10', playerName: 'Lukáš Zbránek', count: 4, period: '02.11.2013 - 05.01.2014' },
  { id: 'lws-11', playerName: 'Lukáš Zbránek', count: 4, period: '02.11.2014 - 13.12.2014' },
  { id: 'lws-12', playerName: 'Lukáš Zbránek', count: 4, period: '27.11.2016 - 15.01.2017' },
  { id: 'lws-13', playerName: 'Lukáš Zbránek', count: 4, period: '09.03.2024 - 20.04.2024' },
];

const quickestThreeGoals: RecordBookRow[] = [
  { id: 'q3-1', playerName: 'Stanislav Prokop', time: '2:02', date: '10.01.2015', opponent: 'FBC Vokovický Šavle (10:2)' },
  { id: 'q3-2', playerName: 'Stanislav Prokop', time: '2:50', date: '10.01.2015', opponent: 'FBC Vokovický Šavle (10:2)' },
  { id: 'q3-3', playerName: 'Stanislav Prokop', time: '3:01', date: '10.01.2015', opponent: 'FBC Vokovický Šavle (10:2)' },
  { id: 'q3-4', playerName: 'Tomáš Pichner', time: '3:17', date: '20.04.2024', opponent: 'Orka Čelákovice B (7:5)' },
  { id: 'q3-5', playerName: 'Jiří Polívka', time: '3:50', date: '27.11.2016', opponent: 'Sport Eden Beroun (12:2)' },
  { id: 'q3-6', playerName: 'Tomáš Pichner', time: '4:36', date: '19.03.2016', opponent: 'Šneci z Pěšin (11:3)' },
  { id: 'q3-7', playerName: 'Jiří Polívka', time: '4:36', date: '19.11.2017', opponent: 'FbŠ Bohemians C (7:9)' },
  { id: 'q3-8', playerName: 'Stanislav Prokop', time: '4:41', date: '02.03.2019', opponent: 'FBC Falcons Žižkov (13:5)' },
  { id: 'q3-9', playerName: 'Jiří Polívka', time: '5:06', date: '09.10.2021', opponent: 'FBC Penguins Praha (11:1)' },
  { id: 'q3-10', playerName: 'Jakub Drexler', time: '5:18', date: '10.02.2019', opponent: 'Kanonýři Kladno C (6:8)' },
];

const quickestTwoGoals: RecordBookRow[] = [
  { id: 'q2-1', playerName: 'Stanislav Prokop', time: '0:04', date: '19.11.2017', opponent: 'SK B.U.H. Praha (9:3)' },
  { id: 'q2-2', playerName: 'Stanislav Prokop', time: '0:09', date: '02.03.2019', opponent: 'FBC Falcons Žižkov (13:5)' },
  { id: 'q2-3', playerName: 'Stanislav Prokop', time: '0:10', date: '06.10.2018', opponent: 'Poison TJ JUNIOR Praha (7:1)' },
  { id: 'q2-4', playerName: 'Robert Hahn', time: '0:12', date: '04.11.2012', opponent: 'SK Lvi Praha - Banko (6:1)' },
  { id: 'q2-5', playerName: 'Stanislav Prokop', time: '0:26', date: '07.01.2018', opponent: 'FbK Olymp Praha B (7:9)' },
  { id: 'q2-6', playerName: 'Jiří Polívka', time: '0:26', date: '29.03.2025', opponent: 'SSK Future (4:7)' },
  { id: 'q2-7', playerName: 'Tomáš Pichner', time: '0:34', date: '06.02.2016', opponent: 'Elite Praha (10:4)' },
  { id: 'q2-8', playerName: 'Stanislav Prokop', time: '0:38', date: '10.01.2015', opponent: 'FBC Vokovický Šavle (10:2)' },
  { id: 'q2-9', playerName: 'Stanislav Prokop', time: '0:47', date: '01.04.2023', opponent: 'IBK Kubánský Klan (11:8)' },
  { id: 'q2-10', playerName: 'Stanislav Prokop', time: '0:49', date: '10.01.2015', opponent: 'FBC Vokovický Šavle (10:2)' },
  { id: 'q2-11', playerName: 'Jakub Drexler', time: '0:49', date: '07.12.2019', opponent: 'IBK Svatý Hole Kladno (8:3)' },
];

const quickestFiveGoals: RecordBookRow[] = [
  { id: 'q5-1', playerName: 'Stanislav Prokop', time: '4:52', date: '10.01.2015', opponent: 'FBC Vokovický Šavle (10:2)' },
  { id: 'q5-2', playerName: 'Stanislav Prokop', time: '19:26', date: '02.03.2019', opponent: 'FBC Falcons Žižkov (13:5)' },
  { id: 'q5-3', playerName: 'Jiří Polívka', time: '19:35', date: '19.11.2017', opponent: 'FbŠ Bohemians C (7:9)' },
  { id: 'q5-4', playerName: 'Stanislav Prokop', time: '20:37', date: '02.03.2019', opponent: 'FBC Falcons Žižkov (13:5)' },
  { id: 'q5-5', playerName: 'Robert Hahn', time: '21:39', date: '01.12.2013', opponent: 'SK B.U.H. Praha B (11:2)' },
];

const quickestSixGoals: RecordBookRow[] = [
  { id: 'q6-1', playerName: 'Stanislav Prokop', time: '25:24', date: '02.03.2019', opponent: 'FBC Falcons Žižkov (13:5)' },
  { id: 'q6-2', playerName: 'Jiří Polívka', time: '25:31', date: '19.11.2017', opponent: 'FbŠ Bohemians C (7:9)' },
];

const quickestFourGoals: RecordBookRow[] = [
  { id: 'q4-1', playerName: 'Stanislav Prokop', time: '3:39', date: '10.01.2015', opponent: 'FBC Vokovický Šavle (10:2)' },
  { id: 'q4-2', playerName: 'Stanislav Prokop', time: '4:14', date: '10.01.2015', opponent: 'FBC Vokovický Šavle (10:2)' },
  { id: 'q4-3', playerName: 'Stanislav Prokop', time: '9:28', date: '02.03.2019', opponent: 'FBC Falcons Žižkov (13:5)' },
  { id: 'q4-4', playerName: 'Jiří Polívka', time: '10:36', date: '19.11.2017', opponent: 'FbŠ Bohemians C (7:9)' },
  { id: 'q4-5', playerName: 'Robert Hahn', time: '13:40', date: '01.12.2013', opponent: 'SK B.U.H. Praha B (11:2)' },
  { id: 'q4-6', playerName: 'Robert Hahn', time: '14:23', date: '01.12.2013', opponent: 'SK B.U.H. Praha B (11:2)' },
  { id: 'q4-7', playerName: 'Stanislav Prokop', time: '14:39', date: '02.03.2019', opponent: 'FBC Falcons Žižkov (13:5)' },
  { id: 'q4-8', playerName: 'Stanislav Prokop', time: '15:09', date: '06.10.2018', opponent: 'Poison TJ JUNIOR Praha (7:1)' },
  { id: 'q4-9', playerName: 'Stanislav Prokop', time: '15:24', date: '27.11.2016', opponent: 'Sport Eden Beroun (12:2)' },
  { id: 'q4-10', playerName: 'Stanislav Prokop', time: '16:05', date: '02.03.2019', opponent: 'FBC Falcons Žižkov (13:5)' },
];

const longestPointStreak: RecordBookRow[] = [
  { id: 'lps-1', playerName: 'Zdeněk Husák', count: '45 ?', period: '12.03.2023 - ?????' },
  { id: 'lps-2', playerName: 'Stanislav Prokop', count: 41, period: '22.10.2016 - 14.04.2018' },
  { id: 'lps-3', playerName: 'Jiří Polívka', count: 40, period: '27.11.2016 - 19.03.2022' },
  { id: 'lps-4', playerName: 'Tomáš Pichner', count: 31, period: '06.10.2018 - 20.09.2020' },
  { id: 'lps-5', playerName: 'Jiří Polívka', count: 25, period: '15.03.2014 - 11.10.2015' },
  { id: 'lps-6', playerName: 'Jakub Drexler', count: 22, period: '27.11.2016 - 25.02.2018' },
  { id: 'lps-7', playerName: 'Stanislav Prokop', count: 21, period: '20.09.2015 - 08.10.2016' },
  { id: 'lps-8', playerName: 'Jakub Drexler', count: 21, period: '08.01.2022 - 04.12.2022' },
  { id: 'lps-9', playerName: 'Robert Hahn', count: 19, period: '22.09.2012 - 28.04.2013' },
  { id: 'lps-10', playerName: 'Tomáš Pichner', count: 18, period: '11.10.2015 - 30.04.2016' },
];

const longestGoalStreak: RecordBookRow[] = [
  { id: 'lgs-1', playerName: 'Jiří Polívka', count: 23, period: '27.11.2016 - 25.02.2018' },
  { id: 'lgs-2', playerName: 'Jiří Polívka', count: 20, period: '15.03.2014 - 12.04.2015' },
  { id: 'lgs-3', playerName: 'Stanislav Prokop', count: 14, period: '19.11.2017 - 25.03.2018' },
  { id: 'lgs-4', playerName: 'Stanislav Prokop', count: 13, period: '22.10.2016 - 12.02.2017' },
  { id: 'lgs-5', playerName: 'Tomáš Leipner', count: 11, period: '28.09.2019 - 18.01.2020' },
  { id: 'lgs-6', playerName: 'Stanislav Prokop', count: 10, period: '13.10.2013 - 18.10.2014' },
  { id: 'lgs-7', playerName: 'Jiří Polívka', count: 10, period: '19.03.2016 - 05.11.2016' },
  { id: 'lgs-8', playerName: 'Stanislav Prokop', count: 10, period: '24.03.2022 - 22.10.2022' },
  { id: 'lgs-9', playerName: 'Zdeněk Husák', count: 10, period: '30.04.2023 - 10.12.2023' },
  { id: 'lgs-10', playerName: 'Stanislav Prokop', count: 9, period: '11.10.2015 - 27.02.2016' },
  { id: 'lgs-11', playerName: 'Stanislav Prokop', count: 9, period: '19.02.2023 - 30.04.2023' },
];

const mostGamesWithoutBreak: RecordBookRow[] = [
  { id: 'mgbp-1', playerName: 'Lukáš Zbránek', count: 76, period: '01.10.2011 - 02.05.2015' },
  { id: 'mgbp-2', playerName: 'František Štiller', count: 66, period: '16.12.2012 - 19.03.2016' },
  { id: 'mgbp-3', playerName: 'Stanislav Prokop', count: 66, period: '27.02.2016 - 15.12.2018' },
  { id: 'mgbp-4', playerName: 'Lukáš Koubek', count: 59, period: '01.10.2011 - 18.10.2014' },
  { id: 'mgbp-5', playerName: 'Jakub Drexler', count: 51, period: '06.10.2018 - 19.03.2022' },
  { id: 'mgbp-6', playerName: 'Tomáš Pichner', count: 45, period: '01.10.2011 - 01.12.2013' },
  { id: 'mgbp-7', playerName: 'Jakub Hříbal', count: 45, period: '10.02.2013 - 12.04.2015' },
  { id: 'mgbp-8', playerName: 'Robert Hahn', count: 42, period: '05.05.2012 - 28.09.2014' },
  { id: 'mgbp-9', playerName: 'Jakub Hříbal', count: 40, period: '16.09.2018 - 19.09.2021' },
  { id: 'mgbp-10', playerName: 'Zdeněk Husák', count: 38, period: '04.12.2022 - 20.04.2024' },
];

export const detailedRecordSections: RecordBookSection[] = [
  {
    key: 'special-teams',
    eyebrow: 'Speciální týmy',
    title: 'Produktivita ve speciálních situacích',
    description: 'Body v přesilovkách, body v oslabení a hattricky v jednom přehledném triptychu.',
    gridClassName: 'xl:grid-cols-3',
    tables: [
      {
        key: 'power-play-points',
        eyebrow: 'Speciální týmy',
        title: 'Body v přesilovkách',
        caption: 'Nejproduktivnější hráči v početních výhodách.',
        accentClassName: 'from-cyan-300/25 via-cyan-200/10 to-transparent',
        iconName: 'zap',
        columns: [
          { key: 'playerName', header: 'Jméno' },
          { key: 'goals', header: 'G', className: 'w-16' },
          { key: 'assists', header: 'A', className: 'w-16' },
          { key: 'points', header: 'B', className: 'w-16' },
        ],
        rows: powerPlayPoints,
      },
      {
        key: 'shorthanded-points',
        eyebrow: 'Speciální týmy',
        title: 'Body v oslabení',
        caption: 'Hráči, kteří rozhodovali i v oslabení.',
        accentClassName: 'from-emerald-300/25 via-emerald-200/10 to-transparent',
        iconName: 'sparkles',
        columns: [
          { key: 'playerName', header: 'Jméno' },
          { key: 'goals', header: 'G', className: 'w-16' },
          { key: 'assists', header: 'A', className: 'w-16' },
          { key: 'points', header: 'B', className: 'w-16' },
        ],
        rows: shorthandedPoints,
      },
      {
        key: 'hattricks',
        eyebrow: 'Střelecké rekordy',
        title: 'Hattricky',
        caption: 'Počet zápasů se třemi a více góly od jednoho hráče.',
        accentClassName: 'from-amber-300/25 via-amber-200/10 to-transparent',
        iconName: 'medal',
        columns: [
          { key: 'playerName', header: 'Jméno' },
          { key: 'count', header: 'Počet', className: 'w-24' },
        ],
        rows: hattricks,
      },
    ],
  },
  {
    key: 'single-game-scoring',
    eyebrow: 'Jednozápasové výkony',
    title: 'Střelecké exploze',
    description: 'Samostatný blok pro čtyři, pět a šest gólů v jediném utkání.',
    gridClassName: 'xl:grid-cols-3',
    tables: [
      {
        key: 'four-goals',
        eyebrow: 'Jednozápasové výkony',
        title: '4 góly v zápase',
        caption: 'Nejčastější čtyřgólové večery v klubové historii.',
        accentClassName: 'from-fuchsia-300/25 via-fuchsia-200/10 to-transparent',
        iconName: 'star',
        columns: [
          { key: 'playerName', header: 'Jméno' },
          { key: 'count', header: 'Počet', className: 'w-24' },
        ],
        rows: fourGoalGames,
      },
      {
        key: 'five-goals',
        eyebrow: 'Jednozápasové výkony',
        title: '5 gólů v zápase',
        caption: 'Mimořádné zápasy, kdy hráč nasázel pět branek.',
        accentClassName: 'from-rose-300/25 via-rose-200/10 to-transparent',
        iconName: 'medal',
        columns: [
          { key: 'playerName', header: 'Jméno' },
          { key: 'count', header: 'Počet', className: 'w-24' },
        ],
        rows: fiveGoalGames,
      },
      {
        key: 'six-goals',
        eyebrow: 'Jednozápasové výkony',
        title: '6 gólů v zápase',
        caption: 'Extrémní střelecké exploze, které se staly jen výjimečně.',
        accentClassName: 'from-violet-300/25 via-violet-200/10 to-transparent',
        iconName: 'star',
        columns: [
          { key: 'playerName', header: 'Jméno' },
          { key: 'count', header: 'Počet', className: 'w-24' },
        ],
        rows: sixGoalGames,
      },
    ],
  },
  {
    key: 'season-productivity',
    eyebrow: 'Produktivita',
    title: 'Body a produktivita v zápase i sezoně',
    description: 'Jednozápasové bodové exploze a sezonní maxima v bodech, asistencích a gólech.',
    gridClassName: 'xl:grid-cols-2',
    tables: [
      {
        key: 'points-in-one-game',
        eyebrow: 'Produktivita',
        title: 'Body v 1 zápase',
        caption: 'Nejlepší individuální bodové zápasy v historii týmu.',
        accentClassName: 'from-sky-300/25 via-sky-200/10 to-transparent',
        iconName: 'zap',
        columns: [
          { key: 'playerName', header: 'Jméno' },
          { key: 'goals', header: 'G', className: 'w-16' },
          { key: 'assists', header: 'A', className: 'w-16' },
          { key: 'points', header: 'B', className: 'w-16' },
          { key: 'season', header: 'Sezóna', className: 'w-28' },
          { key: 'opponent', header: 'Soupeř', className: 'min-w-[14rem]' },
        ],
        rows: pointsInOneGame,
      },
      {
        key: 'points-in-season',
        eyebrow: 'Produktivita',
        title: 'Body v sezóně',
        caption: 'Nejproduktivnější ročníky podle bodového součtu.',
        accentClassName: 'from-cyan-300/25 via-cyan-200/10 to-transparent',
        iconName: 'medal',
        columns: [
          { key: 'playerName', header: 'Jméno' },
          { key: 'matches', header: 'Z', className: 'w-16' },
          { key: 'goals', header: 'G', className: 'w-16' },
          { key: 'assists', header: 'A', className: 'w-16' },
          { key: 'points', header: 'B', className: 'w-16' },
          { key: 'season', header: 'Sezóna', className: 'w-28' },
        ],
        rows: pointsInSeason,
      },
      {
        key: 'assists-in-season',
        eyebrow: 'Produktivita',
        title: 'Asistence v sezóně',
        caption: 'Sezony s nejvyšším počtem nahrávek.',
        accentClassName: 'from-emerald-300/25 via-emerald-200/10 to-transparent',
        iconName: 'sparkles',
        columns: [
          { key: 'playerName', header: 'Jméno' },
          { key: 'matches', header: 'Z', className: 'w-16' },
          { key: 'assists', header: 'A', className: 'w-16' },
          { key: 'season', header: 'Sezóna', className: 'w-28' },
        ],
        rows: assistsInSeason,
      },
      {
        key: 'goals-in-season',
        eyebrow: 'Produktivita',
        title: 'Góly v sezóně',
        caption: 'Nejlepší střelecké ročníky v klubové historii.',
        accentClassName: 'from-amber-300/25 via-amber-200/10 to-transparent',
        iconName: 'star',
        columns: [
          { key: 'playerName', header: 'Jméno' },
          { key: 'matches', header: 'Z', className: 'w-16' },
          { key: 'goals', header: 'G', className: 'w-16' },
          { key: 'season', header: 'Sezóna', className: 'w-28' },
        ],
        rows: goalsInSeason,
      },
    ],
  },
  {
    key: 'speed-records',
    eyebrow: 'Časové rekordy',
    title: 'Nejrychlejší góly a hattricky',
    description: 'Kdo udeřil nejrychleji a jak rychle padaly série branek v jednom utkání.',
    gridClassName: 'xl:grid-cols-2',
    tables: [
      {
        key: 'quickest-goal',
        eyebrow: 'Časové rekordy',
        title: 'Nejrychlejší gól',
        caption: 'Okamžité zásahy po úvodním vhazování.',
        accentClassName: 'from-cyan-300/25 via-cyan-200/10 to-transparent',
        iconName: 'clock',
        columns: [
          { key: 'playerName', header: 'Jméno' },
          { key: 'time', header: 'Čas', className: 'w-20' },
          { key: 'date', header: 'Datum', className: 'w-28' },
          { key: 'opponent', header: 'Soupeř', className: 'min-w-[14rem]' },
        ],
        rows: quickestGoal,
      },
      {
        key: 'quickest-hattrick',
        eyebrow: 'Časové rekordy',
        title: 'Nejrychlejší hattrick',
        caption: 'Hattricky měřené od začátku zápasu.',
        accentClassName: 'from-emerald-300/25 via-emerald-200/10 to-transparent',
        iconName: 'clock',
        columns: [
          { key: 'playerName', header: 'Jméno' },
          { key: 'time', header: 'Čas', className: 'w-20' },
          { key: 'date', header: 'Datum', className: 'w-28' },
          { key: 'opponent', header: 'Soupeř', className: 'min-w-[14rem]' },
        ],
        rows: quickestHattrick,
      },
      {
        key: 'quickest-two-goals',
        eyebrow: 'Časové rekordy',
        title: 'Nejrychlejší 2 góly',
        caption: 'Nejkratší interval pro dva góly od jednoho hráče.',
        accentClassName: 'from-fuchsia-300/25 via-fuchsia-200/10 to-transparent',
        iconName: 'clock',
        columns: [
          { key: 'playerName', header: 'Jméno' },
          { key: 'time', header: 'Čas', className: 'w-20' },
          { key: 'date', header: 'Datum', className: 'w-28' },
          { key: 'opponent', header: 'Soupeř', className: 'min-w-[14rem]' },
        ],
        rows: quickestTwoGoals,
      },
      {
        key: 'quickest-three-goals',
        eyebrow: 'Časové rekordy',
        title: 'Nejrychlejší 3 góly',
        caption: 'Třígólové pasáže na hranici sprintu.',
        accentClassName: 'from-rose-300/25 via-rose-200/10 to-transparent',
        iconName: 'clock',
        columns: [
          { key: 'playerName', header: 'Jméno' },
          { key: 'time', header: 'Čas', className: 'w-20' },
          { key: 'date', header: 'Datum', className: 'w-28' },
          { key: 'opponent', header: 'Soupeř', className: 'min-w-[14rem]' },
        ],
        rows: quickestThreeGoals,
      },
      {
        key: 'quickest-four-goals',
        eyebrow: 'Časové rekordy',
        title: 'Nejrychlejší 4 góly',
        caption: 'Čtyři zásahy v jednom krátkém úseku utkání.',
        accentClassName: 'from-violet-300/25 via-violet-200/10 to-transparent',
        iconName: 'clock',
        columns: [
          { key: 'playerName', header: 'Jméno' },
          { key: 'time', header: 'Čas', className: 'w-20' },
          { key: 'date', header: 'Datum', className: 'w-28' },
          { key: 'opponent', header: 'Soupeř', className: 'min-w-[14rem]' },
        ],
        rows: quickestFourGoals,
      },
      {
        key: 'quickest-five-goals',
        eyebrow: 'Časové rekordy',
        title: 'Nejrychlejších 5 gólů',
        caption: 'Nejsilnější pětigólové útočné vlny.',
        accentClassName: 'from-amber-300/25 via-amber-200/10 to-transparent',
        iconName: 'clock',
        columns: [
          { key: 'playerName', header: 'Jméno' },
          { key: 'time', header: 'Čas', className: 'w-20' },
          { key: 'date', header: 'Datum', className: 'w-28' },
          { key: 'opponent', header: 'Soupeř', className: 'min-w-[14rem]' },
        ],
        rows: quickestFiveGoals,
      },
      {
        key: 'quickest-six-goals',
        eyebrow: 'Časové rekordy',
        title: 'Nejrychlejších 6 gólů',
        caption: 'Šestigólové rekordy, které se povedly jen dvakrát.',
        accentClassName: 'from-sky-300/25 via-sky-200/10 to-transparent',
        iconName: 'clock',
        columns: [
          { key: 'playerName', header: 'Jméno' },
          { key: 'time', header: 'Čas', className: 'w-20' },
          { key: 'date', header: 'Datum', className: 'w-28' },
          { key: 'opponent', header: 'Soupeř', className: 'min-w-[14rem]' },
        ],
        rows: quickestSixGoals,
      },
    ],
  },
  {
    key: 'streaks',
    eyebrow: 'Série a výdrž',
    title: 'Dlouhé série a kontinuální výkony',
    description: 'Vítězné série, bodová kontinuita, gólové šňůry a dlouhé úseky bez inkasovaného gólu.',
    gridClassName: 'xl:grid-cols-2',
    tables: [
      {
        key: 'longest-no-goal-streak',
        eyebrow: 'Brankářské rekordy',
        title: 'Nejdelší série bez gólu',
        caption: 'Nejdelší úseky bez inkasované branky.',
        accentClassName: 'from-cyan-300/25 via-cyan-200/10 to-transparent',
        iconName: 'medal',
        columns: [
          { key: 'playerName', header: 'Jméno' },
          { key: 'time', header: 'Čas', className: 'w-24' },
          { key: 'period', header: 'Období', className: 'min-w-[14rem]' },
        ],
        rows: longestNoGoalStreak,
      },
      {
        key: 'longest-winning-streak',
        eyebrow: 'Brankářské rekordy',
        title: 'Nejdelší vítězná série',
        caption: 'Počet zápasů v řadě bez porážky pro brankáře.',
        accentClassName: 'from-emerald-300/25 via-emerald-200/10 to-transparent',
        iconName: 'sparkles',
        columns: [
          { key: 'playerName', header: 'Jméno' },
          { key: 'count', header: 'Počet zápasů', className: 'w-28' },
          { key: 'period', header: 'Období', className: 'min-w-[14rem]' },
        ],
        rows: longestWinningStreak,
      },
      {
        key: 'longest-point-streak',
        eyebrow: 'Hráčské série',
        title: 'Nejdelší bodová série',
        caption: 'Počet zápasů v řadě s bodem. Nejasný záznam je ponechaný podle zdroje.',
        accentClassName: 'from-fuchsia-300/25 via-fuchsia-200/10 to-transparent',
        iconName: 'star',
        columns: [
          { key: 'playerName', header: 'Jméno' },
          { key: 'count', header: 'Počet zápasů', className: 'w-28' },
          { key: 'period', header: 'Období', className: 'min-w-[14rem]' },
        ],
        rows: longestPointStreak,
      },
      {
        key: 'longest-goal-streak',
        eyebrow: 'Hráčské série',
        title: 'Nejdelší gólová série',
        caption: 'Kolik zápasů v řadě zvládl hráč skórovat.',
        accentClassName: 'from-rose-300/25 via-rose-200/10 to-transparent',
        iconName: 'star',
        columns: [
          { key: 'playerName', header: 'Jméno' },
          { key: 'count', header: 'Počet zápasů', className: 'w-28' },
          { key: 'period', header: 'Období', className: 'min-w-[14rem]' },
        ],
        rows: longestGoalStreak,
      },
      {
        key: 'most-games-without-break',
        eyebrow: 'Výdrž',
        title: 'Nejvíce zápasů bez pauzy',
        caption: 'Nejdelší šňůry odehraných utkání bez vynechaného startu.',
        accentClassName: 'from-violet-300/25 via-violet-200/10 to-transparent',
        iconName: 'medal',
        columns: [
          { key: 'playerName', header: 'Jméno' },
          { key: 'count', header: 'Počet zápasů', className: 'w-28' },
          { key: 'period', header: 'Období', className: 'min-w-[14rem]' },
        ],
        rows: mostGamesWithoutBreak,
      },
    ],
  },
];