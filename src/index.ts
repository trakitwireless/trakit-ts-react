/**
 * ReactJS library.
 * {@link https://github.com/trakitwireless/trakit-ts-sync|Client synchronization library.}
 * Last updated on Thu June 11 2026 15:43:01 
 * @copyright Trak-iT Wireless Inc. 2026
 */

import useConnection, { UseConnectionResult } from "./hooks/useConnection";
import useIsOnline from "./hooks/useIsOnline";
import useSync, { UseSyncResult } from "./hooks/useSync";

/**
 * Version number for this release.
 */
export const version = '0.0.0';

/**
 * Hooks
 */
export {
    useConnection,
    useIsOnline,
    useSync,
    type UseConnectionResult,
    type UseSyncResult
};
