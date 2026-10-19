import { useSyncExternalStore } from 'react'

/**
 * 
 * @returns 
 */
function getSnapshot() {
	return window.innerWidth <= 720;
}
/**
 * 
 * @param callback 
 * @returns 
 */
function subscribe(callback: () => void) {
	window.addEventListener('resize', callback);
	return () => {
		window.removeEventListener('resize', callback);
	};
}

export default function useIsMobile() {
	return useSyncExternalStore(subscribe, getSnapshot);
}