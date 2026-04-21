export const formatNumber = (value: number): string => {
  return value.toLocaleString("cs-CZ");
};

export const formatDate = (value: string): string => {
  return new Intl.DateTimeFormat('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
};

export const formatMinutes = (value: number): string => {
  return `${value} min`;
};

export const getScoreLabel = (ourScore: number, opponentScore: number): string => {
  return `${ourScore}:${opponentScore}`;
};

export const getResultTone = (result: 'W' | 'L' | 'D'): string => {
  if (result === 'W') {
    return 'text-emerald-300';
  }

  if (result === 'L') {
    return 'text-rose-300';
  }

  return 'text-amber-200';
};
