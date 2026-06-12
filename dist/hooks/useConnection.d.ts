import { guid, Machine, nothing, url, User } from '@trakit/objects';
import { TrakitSyncCommander } from '@trakit/sync';
/**
 * The result of the `useConnection` hook, providing the synchronizer instance and connection state.
 */
export type UseConnectionResult = {
    /**
     * The synchronizer instance used for commands.
     */
    synchronizer: TrakitSyncCommander;
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
    ghostId: guid | nothing;
    /**
     * Indicates whether the WebSocket connection is currently online.
     */
    online: boolean;
    /**
     * The {@link User} information associated with the current session, if available.
     */
    user: User | nothing;
    /**
     * The {@link Machine|API credentials} associated with the current session, if available.
     */
    machine: Machine | nothing;
};
/**
 * A React hook that manages the connection to the Trakit synchronization service.
 * It initializes the synchronizer, listens for connection and account events,
 * and provides the current connection state and user/machine information.
 */
export default function useConnection(restAddress?: URL | url, socketAddress?: URL | url): UseConnectionResult;
//# sourceMappingURL=useConnection.d.ts.map