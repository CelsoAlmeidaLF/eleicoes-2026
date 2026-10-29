/**
 * Service Worker do Painel 2026 (PWA)
 * - Pré-carrega o "app shell" para abrir offline.
 * - Páginas (navegação): rede primeiro; sem rede, abre o index.html do cache.
 * - Demais arquivos do próprio site: responde do cache e atualiza em segundo plano (stale-while-revalidate),
 *   então uma nova versão aparece no carregamento seguinte.
 * - A base municipal (~2 MB) e as zonas (~0,7 MB) não são pré-carregadas: entram no cache na primeira vez que
 *   a aba Municipal ou o detalhe de um município são abertos.
 * - Requisições para outros domínios não passam pelo cache (o app não faz nenhuma). Zero telemetria.
 * Ao mudar a lista do shell, incremente CACHE_VERSION.
 */
const CACHE_VERSION = 'stk-gov-br-v14';

const APP_SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',
  'vendor/stk-gov/stk-gov.css',
  'vendor/stk-gov/stk-gov-shell.js',
  'css/style.css',
  'css/fonts.css',
  'vendor/fonts/inter-latin-400-normal.woff2',
  'vendor/fonts/inter-latin-500-normal.woff2',
  'vendor/fonts/inter-latin-600-normal.woff2',
  'vendor/fonts/inter-latin-700-normal.woff2',
  'vendor/fonts/ibm-plex-mono-latin-400-normal.woff2',
  'vendor/fonts/ibm-plex-mono-latin-500-normal.woff2',
  'vendor/fonts/ibm-plex-mono-latin-600-normal.woff2',
  'vendor/chart.js-4.4.1/chart.umd.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/favicon-64.png',
  'icons/logo-96.png',
  'src/Program.js',
  'src/ui/ElectionUIController.js',
  'src/ui/UrlState.js',
  'src/ui/NoticiasView.js',
  'src/ui/Ligacoes.js',
  'src/infrastructure/data/NoticiasData.js',
  'src/infrastructure/data/AuditoriaData.js',
  'src/infrastructure/data/AuditoriaUrnasData.js',
  'src/application/services/ElectionAnalysisService.js',
  'src/application/services/ExportService.js',
  'src/domain/models/DemographicBands.js',
  'src/domain/models/MunicipalityElection.js',
  'src/domain/models/StateElection.js',
  'src/domain/models/ZoneElection.js',
  'src/domain/ports/IElectionRepository.js',
  'src/domain/ports/IExportService.js',
  'src/infrastructure/charts/ElectionChartAdapter.js',
  'src/infrastructure/data/BrazilElectionData.js',
  'src/infrastructure/icons/Icons.js',
  'src/infrastructure/lib/escapeHtml.js',
  'src/infrastructure/lib/stk-pkt-linq.js',
  'src/infrastructure/maps/BrazilMapAdapter.js',
  'src/infrastructure/maps/BrazilMapPaths.js',
  'src/infrastructure/pwa/PwaAdapter.js',
  'src/infrastructure/repositories/ElectionRepository.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('stk-gov-br-') && k !== CACHE_VERSION).map(k => caches.delete(k)))) // só os caches deste app
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navegação: rede primeiro (HTML sempre atual); sem rede, abre o index.html do shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('index.html', { cacheName: CACHE_VERSION }))
    );
    return;
  }

  const cacheKey = request;

  event.respondWith(
    caches.open(CACHE_VERSION).then(async cache => {
      const cached = await cache.match(cacheKey);
      const network = fetch(request)
        .then(response => {
          if (response.ok) cache.put(cacheKey, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
