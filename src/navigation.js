export const PAGE_PATHS = {
  home: '/',
  trending: '/trending',
  search: '/search',
  recommendations: '/account?tab=for-you',
  'ai-assistant': '/ai-assistant',
  'watch-later': '/account',
  ratings: '/account',
  account: '/account',
  settings: '/settings',
  actors: '/actors',
  'box-office': '/box-office',
  'all-movies': '/all-movies',
  signup: '/signup',
};

export function pathForPage(pageId) {
  return PAGE_PATHS[pageId] ?? '/';
}

export function pageFromPath(pathname) {
  const path = pathname.replace(/\/$/, '') || '/';
  if (path === '/') return 'home';
  if (path.startsWith('/movie/')) return 'movie-details';
  if (path === '/account') return 'account';

  const match = Object.entries(PAGE_PATHS).find(([, route]) => route === path);
  return match?.[0] ?? 'home';
}
