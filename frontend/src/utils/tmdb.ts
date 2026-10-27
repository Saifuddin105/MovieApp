const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const PLACEHOLDER_POSTER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750" fill="%2312161f"><rect width="500" height="750" fill="%2312161f"/><path d="M220 340h60v70h-60z" fill="%23202736"/><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-family="sans-serif" font-size="20">No Poster Available</text></svg>';

export const PLACEHOLDER_BACKDROP =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" fill="%2312161f"><rect width="1280" height="720" fill="%2312161f"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-family="sans-serif" font-size="32">No Backdrop Available</text></svg>';

export function getPosterUrl(
  path: string | null | undefined,
  size: 'w185' | 'w342' | 'w500' | 'original' = 'w500',
): string {
  if (!path) return PLACEHOLDER_POSTER;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getBackdropUrl(
  path: string | null | undefined,
  size: 'w780' | 'w1280' | 'original' = 'w1280',
): string {
  if (!path) return PLACEHOLDER_BACKDROP;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getProfileUrl(
  path: string | null | undefined,
  size: 'w185' | 'h632' | 'original' = 'w185',
): string {
  if (!path) {
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="185" height="278" viewBox="0 0 185 278" fill="%2312161f"><rect width="185" height="278" fill="%2312161f"/><circle cx="92" cy="90" r="40" fill="%23202736"/><path d="M40 220c0-30 25-50 52-50s52 20 52 50" fill="%23202736"/></svg>';
  }
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function formatRating(rating: number | null | undefined): string {
  if (rating === null || rating === undefined || rating === 0) return 'NR';
  return rating.toFixed(1);
}

export function formatRuntime(minutes: number | null | undefined): string {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

export function formatReleaseYear(dateString: string | null | undefined): string {
  if (!dateString) return 'TBA';
  const year = dateString.split('-')[0];
  return year || 'TBA';
}

export function getYouTubeEmbedUrl(key: string): string {
  return `https://www.youtube-nocookie.com/embed/${key}?autoplay=1&rel=0&modestbranding=1`;
}

