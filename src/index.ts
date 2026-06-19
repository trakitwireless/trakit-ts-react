/**
 * ReactJS library.
 * {@link https://github.com/trakitwireless/trakit-ts-react|ReactJS controls.}
 * Last updated on Thu June 11 2026 15:43:01 
 * @copyright Trak-iT Wireless Inc. 2026
 */

import {
    useConnection,
    UseConnectionResult,
} from "./hooks/useConnection";
import useIsOnline from "./hooks/useIsOnline";
import {
    useSingle,
    useSync,
    UseSyncMultiple,
    UseSyncResult,
    UseSyncSingle,
} from "./hooks/useSync";
//import { ConnectionProvider } from "./providers/ConnectionProvider";

/**
 * Version number for this release.
 */
export const version = '0.0.5';

/**
 * Hooks
 */
export {
    useConnection,
    useIsOnline,
    useSingle,
    useSync,
    type UseConnectionResult,
    type UseSyncMultiple,
    type UseSyncResult,
    type UseSyncSingle
};

///**
// * Providers
// */
//export {
//    ConnectionProvider,
//};
