const CACHE_NAME = 'v1_cache';
const urlsToCache = [
	'https://fonts.googleapis.com/css2?family=Poppins&display=swap',
	'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css',
	"https://fonts.googleapis.com/css2?family=Lato&display=swap",
	"https://fonts.googleapis.com/icon?family=Material+Icons",
	"https://fonts.googleapis.com/css2?family=Material+Icons+Two+Tone"
];

//* ------------------------------
self.addEventListener('install', e => {
	e.waitUntil(
		caches.open(CACHE_NAME)
		.then(cache => {
			return cache.addAll(urlsToCache)
			.then(() => self.skipWaiting())
		})
		.catch(err => console.log('Falló registro de cache ' + CACHE_NAME, err))
	);
});

self.addEventListener('activate', e => {
	const cacheWhitelist = [CACHE_NAME]

	e.waitUntil(
		caches.keys()
		.then(cacheNames => {
			return Promise.all(
				cacheNames.map(cacheName => {
					if(cacheWhitelist.indexOf(cacheName) === -1) 
						return caches.delete(cacheName);
				})
			)
		})
		.then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', e => {
	e.respondWith(
		caches
			.match(e.request)
			.then(res => {
				if(res) return res;
				return fetch(e.request);
			})
	);
});
