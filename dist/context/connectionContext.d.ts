import { guid, Machine, nothing, url, User } from '@trakit/objects';
import { TrakitSyncCommander } from '@trakit/sync';
import { ReactNode } from 'react';
/**
 * The result of the `useConnection` hook, providing the synchronizer instance and connection state.
 */
export type ConnectionContextType = {
    /**
     * The synchronizer instance used for commands.
     */
    readonly synchronizer: TrakitSyncCommander;
    /**
     * Indicates whether the connection is ready for use.
     * Will be `true` if there is {@link User|user session} or {@link Machine|API credentials}
     * available and the underlying WebSocket connection has been established,
     * or if there is no authentication details given.
     */
    ready: boolean;
    /**
     * The session ID taken from a login command.
     */
    ghostId: guid;
    /**
     * Indicates whether the WebSocket connection is currently online.
     */
    online: boolean;
    /**
     * The {@link User} information associated with the current session, if available.
     */
    user: User | null;
    /**
     * The {@link Machine|API credentials} associated with the current session, if available.
     */
    machine: Machine | null;
};
/**
 * Provider component that wraps the application with CookiesProvider.
 * Required for the `useConnection` hook to work properly.
 *
 * @example
 * ```tsx
 * import { ConnectionProvider, useConnection } from '@trakit/react';
 *
 * function App() {
 *   return (
 *     <ConnectionProvider>
 *       <YourComponent />
 *     </ConnectionProvider>
 *   );
 * }
 * ```
 */
export declare function ConnectionProvider({ children, restAddress, socketAddress }: {
    children: ReactNode;
    restAddress?: URL | url | nothing;
    socketAddress?: URL | url | nothing;
}): import("react").JSX.Element;
/**
 * A React hook that manages the connection to the Trak-iT synchronization service.
 * It initializes the synchronizer, listens for connection and account events,
 * and provides the current connection state and user/machine information.
 */
export declare function useConnection(): ConnectionContextType;
//# sourceMappingURL=connectionContext.d.ts.map