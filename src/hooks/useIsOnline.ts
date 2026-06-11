'use client';

import { useSyncExternalStore } from 'react'

/**
 * Subscribes to the browser's online/offline events, returning a boolean indicating whether
 * the client is currently online.  This is a thin wrapper around `useSyncExternalStore` and
 * the browser's `navigator.onLine` property, so it should be very efficient and not cause
 * unnecessary re-renders.
 * @returns `true` if the client is online, `false` if offline.
 */
function subscribe(callback: () => void) {
	window.addEventListener('online', callback);
	window.addEventListener('offline', callback);
	return () => {
		window.removeEventListener('online', callback);
		window.removeEventListener('offline', callback);
	};
}
/**
 * Returns a boolean indicating whether the client is currently online.
 */
function getClientSnapshot(): boolean { return navigator.onLine; }
/**
 * Not used, but defined just in case.
 */
function getServerSnapshot(): boolean { return true; }

/**
 * Returns a boolean indicating whether the client is currently online.
 */
export default function useIsOnline():boolean {
	return useSyncExternalStore(
		subscribe,
		getClientSnapshot,
		getServerSnapshot
	);
}