/**
 * ReactJS library.
 * {@link https://github.com/trakitwireless/trakit-ts-react|ReactJS controls.}
 * Last updated on Thu June 11 2026 15:43:01
 * @copyright Trak-iT Wireless Inc. 2026
 */
import { ApiProvider, useApi, type ApiContextType } from "./context/apiContext";
import useIsOnline from "./hooks/useIsOnline";
import { useSingle, useSync, UseSyncMultiple, UseSyncResult, UseSyncSingle } from "./hooks/useSync";
/**
 * Version number for this release.
 */
export declare const version = "0.0.12";
/**
 * Hooks
 */
export { useApi, useIsOnline, useSingle, useSync, type UseSyncMultiple, type UseSyncResult, type UseSyncSingle };
/**
 * Context provider for connection state and API instances.
 */
export { ApiProvider, type ApiContextType };
//# sourceMappingURL=index.d.ts.map