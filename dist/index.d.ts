/**
 * ReactJS library.
 * {@link https://github.com/trakitwireless/trakit-ts-react|ReactJS controls.}
 * Last updated on Thu June 11 2026 15:43:01
 * @copyright Trak-iT Wireless Inc. 2026
 */
import { TrakitProvider, useTrakit, type TrakitContextType } from "./context/apiContext";
import useIsOnline from "./hooks/useIsOnline";
import { useSingle, useSync, UseSyncMultiple, UseSyncResult, UseSyncSingle } from "./hooks/useSync";
/**
 * Version number for this release.
 */
export declare const version = "0.0.13";
/**
 * Hooks
 */
export { useIsOnline, useSingle, useSync, useTrakit, type UseSyncMultiple, type UseSyncResult, type UseSyncSingle, };
/**
 * Context provider for connection state and API instances.
 */
export { TrakitProvider, type TrakitContextType, };
//# sourceMappingURL=index.d.ts.map