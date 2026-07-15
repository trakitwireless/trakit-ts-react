/**
 * ReactJS library.
 * {@link https://github.com/trakitwireless/trakit-ts-react|ReactJS controls.}
 * Last updated on Thu June 11 2026 15:43:01 
 * @copyright Trak-iT Wireless Inc. 2026
 */

import {
    ConnectionProvider,
    useConnection,
    type ConnectionContextType,
} from "./context/connectionContext";
import { useAudit } from "./hooks/useAudit";
import useIsOnline from "./hooks/useIsOnline";
import {
    useSingle,
    useSync,
    UseSyncMultiple,
    UseSyncResult,
    UseSyncSingle,
} from "./hooks/useSync";

/**
 * Version number for this release.
 */
export const version = '0.0.11';

/**
 * Hooks
 */
export {
	useAudit,
	useConnection,
	useIsOnline,
	useSingle,
	useSync,
	type UseSyncMultiple,
	type UseSyncResult,
	type UseSyncSingle
};

/**
 * Context provider for connection state and synchronizer instance.
 */
export {
	ConnectionProvider,
	type ConnectionContextType
};
