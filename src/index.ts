/**
 * ReactJS library.
 * {@link https://github.com/trakitwireless/trakit-ts-react|ReactJS controls.}
 * Last updated on Thu June 11 2026 15:43:01 
 * @copyright Trak-iT Wireless Inc. 2026
 */

import useConnection, { UseConnectionResult } from "./hooks/useConnection";
import useIsOnline from "./hooks/useIsOnline";
import useSync, { UseSyncResult } from "./hooks/useSync";
import useSyncs from "./hooks/useSyncs";

/**
 * Version number for this release.
 */
export const version = '0.0.2';

/**
 * Hooks
 */
export {
    useConnection,
    useIsOnline,
    useSync,
    useSyncs,
    type UseConnectionResult,
    type UseSyncResult
};
