const SERVICE_WORKER_URL = '/sw.js';

async function registerOnLoad(): Promise<void> {
	try {
		await navigator.serviceWorker.register(SERVICE_WORKER_URL);
	} catch (error) {
		console.error('Service worker registration failed', error);
	}
}

export function registerServiceWorker(): void {
	if (!('serviceWorker' in navigator)) return;
	if (document.readyState === 'complete') return void registerOnLoad();

	window.addEventListener('load', () => void registerOnLoad());
}
