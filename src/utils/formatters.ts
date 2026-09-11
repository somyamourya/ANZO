export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const formattedMins = mins.toString().padStart(2, '0');
  const formattedSecs = secs.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${hrs}:${formattedMins}:${formattedSecs}`;
  }
  return `${formattedMins}:${formattedSecs}`;
}

export function formatScore(score?: number): string {
  if (score === undefined || score === null || score <= 0) return 'N/A';
  if (score > 10) {
    return (score / 10).toFixed(1);
  }
  return score.toFixed(1);
}

export function formatSeason(season?: string, year?: number): string {
  if (!season && !year) return 'Unknown';
  const s = season ? season.charAt(0).toUpperCase() + season.slice(1).toLowerCase() : '';
  return `${s} ${year || ''}`.trim();
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
