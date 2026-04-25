import type { TeamScope } from '@components/UI/ScopeTabs';
import type { RecordBookIconName } from '@utils/recordsBookData';

export interface TeamRecordRow {
  id: string;
  score?: string;
  opponent?: string;
  date?: string;
  count?: number | string;
  period?: string;
  time?: string;
}

export interface TeamRecordColumn {
  key: keyof TeamRecordRow;
  header: string;
  className?: string;
}

export interface TeamRecordTable {
  key: string;
  eyebrow: string;
  title: string;
  caption: string;
  accentClassName: string;
  iconName: RecordBookIconName;
  columns: TeamRecordColumn[];
  rows: TeamRecordRow[];
}

export interface TeamRecordSection {
  key: string;
  eyebrow: string;
  title: string;
  description: string;
  gridClassName: string;
  tables: TeamRecordTable[];
}

export const teamRecordHeroStats: Record<TeamScope, Array<{ label: string; value: string; note: string }>> = {
  A: [
    { label: 'Nejvyšší výhra', value: '15:3', note: 'IBK Kubánský Klan B' },
    { label: 'Nejdelší série výher', value: '24', note: '20.09.2020 - 17.09.2022' },
    { label: 'Nejrychlejší 2 góly', value: '0:04', note: 'více zápasů' },
  ],
  B: [
    { label: 'Detail rekordů', value: 'A', note: 'Zapsáno podle dodaného výřezu' },
    { label: 'Další scope', value: 'brzy', note: 'B týmové rekordy zatím nejsou rozepsané' },
    { label: 'Status', value: 'draft', note: 'Layout je připravený i pro další data' },
  ],
  C: [
    { label: 'Detail rekordů', value: 'A', note: 'Zapsáno podle dodaného výřezu' },
    { label: 'Další scope', value: 'brzy', note: 'C týmové rekordy zatím nejsou rozepsané' },
    { label: 'Status', value: 'draft', note: 'Layout je připravený i pro další data' },
  ],
  ALL: [
    { label: 'Detail rekordů', value: 'A', note: 'Zapsáno podle dodaného výřezu' },
    { label: 'Další scope', value: 'brzy', note: 'Souhrn A+B+C zatím není rozepsaný' },
    { label: 'Status', value: 'draft', note: 'Layout je připravený i pro další data' },
  ],
};

const highestWins: TeamRecordRow[] = [
  { id: 'hw-1', score: '14:1', opponent: 'FbC Engineers', date: '09.02.2020' },
  { id: 'hw-2', score: '15:3', opponent: 'IBK Kubánský Klan B', date: '10.12.2016' },
  { id: 'hw-3', score: '12:1', opponent: 'FbC Engineers', date: '06.01.2024' },
  { id: 'hw-4', score: '11:0', opponent: 'SK Lators', date: '15.03.2014' },
  { id: 'hw-5', score: '11:0', opponent: 'FBK Sokol Dobřichovice', date: '16.03.2013' },
  { id: 'hw-6', score: '12:2', opponent: 'Sport Eden Beroun', date: '27.11.2016' },
  { id: 'hw-7', score: '12:2', opponent: 'IBK Tajula', date: '02.03.2019' },
  { id: 'hw-8', score: '12:2', opponent: 'Black Angels Benfica', date: '01.02.2025' },
  { id: 'hw-9', score: '11:1', opponent: 'FBC Penguins Praha', date: '09.10.2021' },
  { id: 'hw-10', score: '13:4', opponent: 'IBK Kubánský Klan B', date: '20.11.2021' },
  { id: 'hw-11', score: '12:3', opponent: 'IBK Tajula', date: '13.10.2019' },
  { id: 'hw-12', score: '12:3', opponent: 'Prague Tigers B', date: '09.10.2022' },
  { id: 'hw-13', score: '11:2', opponent: 'SK B.U.H. Praha B', date: '01.12.2013' },
  { id: 'hw-14', score: '10:1', opponent: 'IBK Kubánský Klan B', date: '05.01.2013' },
  { id: 'hw-15', score: '10:1', opponent: 'Game Over Praha', date: '30.04.2022' },
  { id: 'hw-16', score: '9:0', opponent: 'SK Panthers Příbram', date: '04.11.2012' },
];

const highestLosses: TeamRecordRow[] = [
  { id: 'hl-1', score: '3:30', opponent: 'FbŠ Bohemians B', date: '13.10.2024' },
  { id: 'hl-2', score: '0:20', opponent: 'FT Sokol Břevnov B', date: '11.12.2011' },
  { id: 'hl-3', score: '3:17', opponent: 'Tatran Střešovice B', date: '08.12.2024' },
  { id: 'hl-4', score: '3:13', opponent: 'T.B.C. Králův Dvůr B', date: '15.01.2017' },
  { id: 'hl-5', score: '2:12', opponent: 'FbK Seals Kladno', date: '28.01.2012' },
  { id: 'hl-6', score: '2:12', opponent: 'FBC VŠTJ Ekonom Praha', date: '06.05.2018' },
  { id: 'hl-7', score: '2:12', opponent: 'FBC Žraloci Příbram', date: '20.04.2024' },
  { id: 'hl-8', score: '2:11', opponent: 'Florbal Neratovice', date: '01.04.2023' },
  { id: 'hl-9', score: '5:13', opponent: 'FK Spartak Praha B', date: '11.12.2011' },
  { id: 'hl-10', score: '7:15', opponent: 'FbŠ Bohemians B', date: '03.05.2025' },
];

const longestLosingStreaks: TeamRecordRow[] = [
  { id: 'lls-1', count: 10, period: '20.04.2024 - 24.11.2024' },
  { id: 'lls-2', count: 7, period: '11.12.2011 - 26.02.2012' },
  { id: 'lls-3', count: 5, period: '06.05.2018 - 06.10.2018' },
  { id: 'lls-4', count: 4, period: '01.10.2011 - 20.11.2011' },
  { id: 'lls-5', count: 4, period: '25.03.2012 - 05.05.2012' },
  { id: 'lls-6', count: 4, period: '08.12.2024 - 01.02.2025' },
  { id: 'lls-7', count: 3, period: '08.10.2016 - 22.10.2016' },
  { id: 'lls-8', count: 3, period: '25.03.2018 - 14.04.2018' },
  { id: 'lls-9', count: 3, period: '15.12.2018 - 13.01.2019' },
  { id: 'lls-10', count: 3, period: '20.11.2022 - 04.12.2022' },
  { id: 'lls-11', count: 3, period: '05.03.2023 - 12.03.2023' },
  { id: 'lls-12', count: 3, period: '12.04.2025 - 03.05.2025' },
];

const longestWinningStreaks: TeamRecordRow[] = [
  { id: 'lws-1', count: 24, period: '20.09.2020 - 17.09.2022' },
  { id: 'lws-2', count: 8, period: '25.10.2015 - 27.02.2016' },
  { id: 'lws-3', count: 8, period: '19.03.2016 - 25.09.2016' },
  { id: 'lws-4', count: 7, period: '08.02.2014 - 13.04.2014' },
  { id: 'lws-5', count: 6, period: '27.10.2019 - 18.01.2020' },
  { id: 'lws-6', count: 6, period: '09.10.2022 - 20.11.2022' },
  { id: 'lws-7', count: 6, period: '10.09.2023 - 18.11.2023' },
  { id: 'lws-8', count: 5, period: '02.03.2013 - 07.04.2013' },
  { id: 'lws-9', count: 5, period: '10.12.2023 - 27.01.2024' },
  { id: 'lws-10', count: 4, period: '02.11.2013 - 05.01.2014' },
  { id: 'lws-11', count: 4, period: '02.11.2014 - 13.12.2014' },
  { id: 'lws-12', count: 4, period: '27.11.2016 - 15.01.2017' },
  { id: 'lws-13', count: 4, period: '09.03.2024 - 20.04.2024' },
];

const mostConcededInMatch: TeamRecordRow[] = [
  { id: 'mc-1', count: 30, opponent: 'FbŠ Bohemians B (3:30)', date: '13.10.2024' },
  { id: 'mc-2', count: 20, opponent: 'FT Sokol Břevnov B (0:20)', date: '11.12.2011' },
  { id: 'mc-3', count: 17, opponent: 'Tatran Střešovice B (3:17)', date: '08.12.2024' },
  { id: 'mc-4', count: 15, opponent: 'FbŠ Bohemians B (7:15)', date: '03.05.2025' },
  { id: 'mc-5', count: 13, opponent: 'FK Spartak Praha B (5:13)', date: '11.12.2011' },
  { id: 'mc-6', count: 13, opponent: 'T.B.C. Králův Dvůr B (3:13)', date: '15.01.2017' },
  { id: 'mc-7', count: 12, opponent: 'FBK Seals Kladno (2:12)', date: '28.01.2012' },
  { id: 'mc-8', count: 12, opponent: 'FBC VŠTJ Ekonom Praha (2:12)', date: '06.05.2018' },
  { id: 'mc-9', count: 12, opponent: 'FBC Žraloci Příbram (2:12)', date: '20.04.2024' },
  { id: 'mc-10', count: 11, opponent: 'IBK Kuřata Kladno (4:11)', date: '05.01.2014' },
  { id: 'mc-11', count: 11, opponent: 'IBK Kuřata Kladno (6:11)', date: '13.04.2014' },
  { id: 'mc-12', count: 11, opponent: 'Florbal Neratovice (2:11)', date: '01.04.2023' },
  { id: 'mc-13', count: 11, opponent: 'Las Plantas (12:11n)', date: '30.04.2023' },
  { id: 'mc-14', count: 11, opponent: 'SK Alien Nation Černošice (4:11)', date: '24.11.2024' },
];

const mostScoredInMatch: TeamRecordRow[] = [
  { id: 'ms-1', count: 15, opponent: 'IBK Kubánský Klan B (15:3)', date: '10.12.2016' },
  { id: 'ms-2', count: 14, opponent: 'FbC Engineers (14:1)', date: '09.02.2020' },
  { id: 'ms-3', count: 13, opponent: 'FBC Falcons Žižkov (13:5)', date: '02.03.2019' },
  { id: 'ms-4', count: 13, opponent: 'IBK Kubánský Klan B (13:4)', date: '20.11.2021' },
  { id: 'ms-5', count: 13, opponent: 'FBC Slavia Praha (13:6)', date: '29.01.2023' },
  { id: 'ms-6', count: 12, opponent: 'TBC Horoměřice B (12:4)', date: '05.01.2014' },
  { id: 'ms-7', count: 12, opponent: 'Sport Eden Beroun (12:2)', date: '27.11.2016' },
  { id: 'ms-8', count: 12, opponent: 'IBK Tajula (12:2)', date: '02.03.2019' },
  { id: 'ms-9', count: 12, opponent: 'IBK Tajula (12:3)', date: '13.10.2019' },
  { id: 'ms-10', count: 12, opponent: 'Prague Tigers B (12:3)', date: '09.10.2022' },
  { id: 'ms-11', count: 12, opponent: 'IBK Kubánský Klan (12:10)', date: '12.03.2023' },
  { id: 'ms-12', count: 12, opponent: 'Las Plantas (12:11n)', date: '30.04.2023' },
  { id: 'ms-13', count: 12, opponent: 'FbC Engineers (12:1)', date: '06.01.2024' },
  { id: 'ms-14', count: 12, opponent: 'Black Angels Benfica', date: '01.02.2025' },
];

const quickestThreeGoals: TeamRecordRow[] = [
  { id: 'q3-1', time: '0:09', opponent: 'Šneci z Pěšin (11:3)', date: '19.03.2016' },
  { id: 'q3-2', time: '0:09', opponent: 'Šneci z Pěšin (11:3)', date: '19.03.2016' },
  { id: 'q3-3', time: '0:26', opponent: 'FBC Penguins Praha (11:1)', date: '09.10.2021' },
  { id: 'q3-4', time: '0:28', opponent: 'FBC Falcons Žižkov (13:5)', date: '02.03.2019' },
  { id: 'q3-5', time: '0:39', opponent: 'FBK VŠSK PaedF UK Praha (5:0)', date: '05.12.2021' },
  { id: 'q3-6', time: '0:45', opponent: 'ELITE PRAHA (10:4)', date: '06.02.2016' },
  { id: 'q3-7', time: '0:47', opponent: 'FBC Ressler Boys (10:2)', date: '10.01.2015' },
  { id: 'q3-8', time: '0:51', opponent: 'Šneci z Pěšin (11:3)', date: '19.03.2016' },
  { id: 'q3-9', time: '0:54', opponent: 'FBC Ressler Boys (10:2)', date: '10.01.2015' },
  { id: 'q3-10', time: '0:54', opponent: 'IBK Tajula (12:2)', date: '02.03.2019' },
  { id: 'q3-11', time: '0:54', opponent: 'Torza Sorry ASI (10:4)', date: '24.03.2022' },
];

const quickestTwoGoals: TeamRecordRow[] = [
  { id: 'q2-1', time: '0:04', opponent: 'Šneci z Pěšin (11:3)', date: '19.03.2016' },
  { id: 'q2-2', time: '0:04', opponent: 'Šneci z Pěšin (11:3)', date: '19.03.2016' },
  { id: 'q2-3', time: '0:04', opponent: 'SK B.U.H. Praha (9:3)', date: '19.11.2017' },
  { id: 'q2-4', time: '0:05', opponent: 'Šneci z Pěšin (11:3)', date: '19.03.2016' },
  { id: 'q2-5', time: '0:05', opponent: 'Tatran Střešovice B (3:17)', date: '08.12.2024' },
  { id: 'q2-6', time: '0:06', opponent: 'FBK Fat Pipe Vosy Praha (10:3)', date: '10.12.2023' },
  { id: 'q2-7', time: '0:06', opponent: 'FBC Žraloci Příbram (9:5)', date: '19.10.2025' },
  { id: 'q2-8', time: '0:07', opponent: 'FBC Vokovický Šavle (10:2)', date: '10.01.2015' },
  { id: 'q2-9', time: '0:07', opponent: 'FBC Ressler Boys (10:2)', date: '10.01.2015' },
  { id: 'q2-10', time: '0:07', opponent: 'FbC Engineers (14:1)', date: '09.02.2020' },
  { id: 'q2-11', time: '0:07', opponent: 'Prague Tigers B (6:9)', date: '05.03.2023' },
];

const quickestFiveGoals: TeamRecordRow[] = [
  { id: 'q5-1', time: '1:00', opponent: 'Šneci z Pěšin (11:3)', date: '19.03.2016' },
  { id: 'q5-2', time: '1:41', opponent: 'Šneci z Pěšin (11:3)', date: '19.03.2016' },
  { id: 'q5-3', time: '2:46', opponent: 'Game Over Praha (10:1)', date: '30.04.2022' },
  { id: 'q5-4', time: '3:04', opponent: 'Šneci z Pěšin (11:3)', date: '19.03.2016' },
  { id: 'q5-5', time: '3:13', opponent: 'Šneci z Pěšin (11:3)', date: '19.03.2016' },
  { id: 'q5-6', time: '3:27', opponent: 'IBK Kubánský Klan B (13:4)', date: '20.11.2021' },
  { id: 'q5-7', time: '3:33', opponent: 'FBC Penguins Praha (11:1)', date: '09.10.2021' },
  { id: 'q5-8', time: '3:42', opponent: 'IBK Svatý Hole Kladno (8:3)', date: '07.12.2019' },
  { id: 'q5-9', time: '3:46', opponent: 'FBC Vokovický Šavle (10:2)', date: '10.01.2015' },
  { id: 'q5-10', time: '3:56', opponent: 'Šneci z Pěšin (11:3)', date: '19.03.2016' },
];

const quickestFourGoals: TeamRecordRow[] = [
  { id: 'q4-1', time: '0:13', opponent: 'Šneci z Pěšin (11:3)', date: '19.03.2016' },
  { id: 'q4-2', time: '0:56', opponent: 'Šneci z Pěšin (11:3)', date: '19.03.2016' },
  { id: 'q4-3', time: '1:31', opponent: 'FBC Penguins Praha (11:1)', date: '09.10.2021' },
  { id: 'q4-4', time: '1:34', opponent: 'FBC Ressler Boys (10:2)', date: '10.01.2015' },
  { id: 'q4-5', time: '1:37', opponent: 'Šneci z Pěšin (11:3)', date: '19.03.2016' },
  { id: 'q4-6', time: '1:38', opponent: 'IBK Kubánský Klan B (13:4)', date: '20.11.2021' },
  { id: 'q4-7', time: '1:56', opponent: 'IBK Kubánský Klan (12:10)', date: '12.03.2023' },
  { id: 'q4-8', time: '2:02', opponent: 'FBC Vokovický Šavle (10:2)', date: '10.01.2015' },
  { id: 'q4-9', time: '2:04', opponent: 'Game Over Praha (10:1)', date: '30.04.2022' },
  { id: 'q4-10', time: '2:19', opponent: 'Game Over Praha (10:1)', date: '30.04.2022' },
];

export const teamRecordSections: TeamRecordSection[] = [
  {
    key: 'scorelines',
    eyebrow: 'Výsledkové extrémy',
    title: 'Nejvyšší výhry a nejtěžší pády',
    description: 'Nejvýraznější výsledky v historii A týmu, ať už šlo o dominantní výhry nebo těžké porážky.',
    gridClassName: 'xl:grid-cols-2',
    tables: [
      {
        key: 'highest-wins',
        eyebrow: 'Týmové rekordy',
        title: 'Nejvyšší výhra',
        caption: 'Nejvyšší vítězství podle výsledku a skóre.',
        accentClassName: 'from-emerald-300/25 via-emerald-200/10 to-transparent',
        iconName: 'sparkles',
        columns: [
          { key: 'score', header: 'Skóre', className: 'w-24' },
          { key: 'opponent', header: 'Soupeř', className: 'min-w-[14rem]' },
          { key: 'date', header: 'Datum', className: 'w-28' },
        ],
        rows: highestWins,
      },
      {
        key: 'highest-losses',
        eyebrow: 'Týmové rekordy',
        title: 'Nejvyšší prohra',
        caption: 'Nejtěžší porážky podle výsledku a výše inkasovaného skóre.',
        accentClassName: 'from-rose-300/25 via-rose-200/10 to-transparent',
        iconName: 'medal',
        columns: [
          { key: 'score', header: 'Skóre', className: 'w-24' },
          { key: 'opponent', header: 'Soupeř', className: 'min-w-[14rem]' },
          { key: 'date', header: 'Datum', className: 'w-28' },
        ],
        rows: highestLosses,
      },
    ],
  },
  {
    key: 'streaks',
    eyebrow: 'Týmová kontinuita',
    title: 'Série výher a proher',
    description: 'Výherní a proherní šňůry ukazují, kdy tým nejvíc držel tempo a kdy naopak spadl do série ztrát.',
    gridClassName: 'xl:grid-cols-2',
    tables: [
      {
        key: 'winning-streaks',
        eyebrow: 'Týmové rekordy',
        title: 'Nejdelší série výher',
        caption: 'Počet zápasů v řadě bez ztráty vítězství.',
        accentClassName: 'from-cyan-300/25 via-cyan-200/10 to-transparent',
        iconName: 'star',
        columns: [
          { key: 'count', header: 'Počet zápasů', className: 'w-28' },
          { key: 'period', header: 'Období', className: 'min-w-[16rem]' },
        ],
        rows: longestWinningStreaks,
      },
      {
        key: 'losing-streaks',
        eyebrow: 'Týmové rekordy',
        title: 'Nejdelší série proher',
        caption: 'Nejdelší období, kdy tým nedokázal sérii zastavit.',
        accentClassName: 'from-amber-300/25 via-amber-200/10 to-transparent',
        iconName: 'zap',
        columns: [
          { key: 'count', header: 'Počet zápasů', className: 'w-28' },
          { key: 'period', header: 'Období', className: 'min-w-[16rem]' },
        ],
        rows: longestLosingStreaks,
      },
    ],
  },
  {
    key: 'match-volume',
    eyebrow: 'Góly v utkání',
    title: 'Nejvíc vstřelených a obdržených gólů',
    description: 'Tabulky zaměřené čistě na týmový ofenzivní a defenzivní extrém v jednotlivých zápasech.',
    gridClassName: 'xl:grid-cols-2',
    tables: [
      {
        key: 'most-scored',
        eyebrow: 'Ofenziva',
        title: 'Nejvíce vstřelených gólů v zápase',
        caption: 'Zápasy, ve kterých útok vystřelil nejvýš.',
        accentClassName: 'from-lime-300/25 via-lime-200/10 to-transparent',
        iconName: 'sparkles',
        columns: [
          { key: 'count', header: 'Počet', className: 'w-20' },
          { key: 'opponent', header: 'Soupeř', className: 'min-w-[16rem]' },
          { key: 'date', header: 'Datum', className: 'w-28' },
        ],
        rows: mostScoredInMatch,
      },
      {
        key: 'most-conceded',
        eyebrow: 'Defenziva',
        title: 'Nejvíce obdržených gólů v zápase',
        caption: 'Zápasy, kde obrana a brankoviště dostaly největší nápor.',
        accentClassName: 'from-fuchsia-300/25 via-fuchsia-200/10 to-transparent',
        iconName: 'medal',
        columns: [
          { key: 'count', header: 'Počet', className: 'w-20' },
          { key: 'opponent', header: 'Soupeř', className: 'min-w-[16rem]' },
          { key: 'date', header: 'Datum', className: 'w-28' },
        ],
        rows: mostConcededInMatch,
      },
    ],
  },
  {
    key: 'speed',
    eyebrow: 'Tempo nástupu',
    title: 'Nejrychlejší týmové gólové šňůry',
    description: 'Jak rychle tým zvládl nasázet dvě, tři, čtyři nebo pět branek v jednom zápase.',
    gridClassName: 'xl:grid-cols-2',
    tables: [
      {
        key: 'quickest-two',
        eyebrow: 'Týmové rekordy',
        title: 'Nejrychlejší 2 góly',
        caption: 'Čas potřebný na první dva zásahy v utkání.',
        accentClassName: 'from-sky-300/25 via-sky-200/10 to-transparent',
        iconName: 'clock',
        columns: [
          { key: 'time', header: 'Čas', className: 'w-20' },
          { key: 'opponent', header: 'Soupeř', className: 'min-w-[16rem]' },
          { key: 'date', header: 'Datum', className: 'w-28' },
        ],
        rows: quickestTwoGoals,
      },
      {
        key: 'quickest-three',
        eyebrow: 'Týmové rekordy',
        title: 'Nejrychlejší 3 góly',
        caption: 'Nejrychlejší trojice zásahů po úvodním vhazování.',
        accentClassName: 'from-indigo-300/25 via-indigo-200/10 to-transparent',
        iconName: 'clock',
        columns: [
          { key: 'time', header: 'Čas', className: 'w-20' },
          { key: 'opponent', header: 'Soupeř', className: 'min-w-[16rem]' },
          { key: 'date', header: 'Datum', className: 'w-28' },
        ],
        rows: quickestThreeGoals,
      },
      {
        key: 'quickest-four',
        eyebrow: 'Týmové rekordy',
        title: 'Nejrychlejší 4 góly',
        caption: 'Čas, ve kterém tým dosáhl na čtyřgólovou metu.',
        accentClassName: 'from-cyan-300/25 via-cyan-200/10 to-transparent',
        iconName: 'clock',
        columns: [
          { key: 'time', header: 'Čas', className: 'w-20' },
          { key: 'opponent', header: 'Soupeř', className: 'min-w-[16rem]' },
          { key: 'date', header: 'Datum', className: 'w-28' },
        ],
        rows: quickestFourGoals,
      },
      {
        key: 'quickest-five',
        eyebrow: 'Týmové rekordy',
        title: 'Nejrychlejších 5 gólů',
        caption: 'Nejrychlejší nástupy do zápasu s pěti vstřelenými góly.',
        accentClassName: 'from-teal-300/25 via-teal-200/10 to-transparent',
        iconName: 'clock',
        columns: [
          { key: 'time', header: 'Čas', className: 'w-20' },
          { key: 'opponent', header: 'Soupeř', className: 'min-w-[16rem]' },
          { key: 'date', header: 'Datum', className: 'w-28' },
        ],
        rows: quickestFiveGoals,
      },
    ],
  },
];