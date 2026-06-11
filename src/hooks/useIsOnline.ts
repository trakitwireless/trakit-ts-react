'use client';

import { useSyncExternalStore } from 'react'

/**
 * 
 * @returns 
 */
function getSnapshot() {
	return navigator.onLine;
}
/**
 * 
 * @param callback 
 * @returns 
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
 * 
 */
function getServerSnapshot() {
	return true;
}

export default function useIsOnline() {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}