const CACHE_NAME = 'bagou-offline-v1';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => cache.add(OFFLINE_URL))
			.then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(deleteOldCaches().then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
	if (event.request.mode !== 'navigate') return;
	event.respondWith(
		fetch(event.request).catch(() => caches.match(OFFLINE_URL))
	);
});

async function deleteOldCaches() {
	const cacheNames = await caches.keys();
	await Promise.all(
		cacheNames
			.filter((cacheName) => cacheName !== CACHE_NAME)
			.map((cacheName) => caches.delete(cacheName))
	);
}
