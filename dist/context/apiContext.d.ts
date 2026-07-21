import { guid, Machine, nothing, url, User } from '@trakit/objects';
import { TrakitAuditCommander, TrakitSyncCommander } from '@trakit/sync';
import { ReactNode } from 'react';
/**
 * The result of the `useConnection` hook, providing the synchronizer instance and connection state.
 */
export type TrakitContextType = {
    /**
     * The synchronizer instance used for commands.
     */
    readonly synchronizer: TrakitSyncCommander;
    /**
     * The auditor instance used for history.
     */
    readonly auditor: TrakitAuditCommander;
    /**
     * Indicates whether the APIs are ready for use.
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
 * Required for the `useTrakit` hook to work properly.
 *
 * @example
 * ```tsx
 * import { TrakitProvider, useTrakit } from '@trakit/react';
 *
 * function App() {
 *   return (
 *     <TrakitProvider>
 *       <YourComponent />
 *     </TrakitProvider>
 *   );
 * }
 * ```
 */
export declare function TrakitProvider({ children, restAddress, socketAddress, auditAddress, }: {
    children: ReactNode;
    restAddress?: URL | url | nothing;
    socketAddress?: URL | url | nothing;
    auditAddress?: URL | url | nothing;
}): import("react").JSX.Element;
/**
 * A React hook that manages the connection to the Trak-iT synchronization service and APIs.
 * It initializes the synchronizer, listens for connection and account events,
 * and provides the current connection state, API instances, and user/machine information.
 */
export declare function useTrakit(): TrakitContextType;
//# sourceMappingURL=apiContext.d.ts.map