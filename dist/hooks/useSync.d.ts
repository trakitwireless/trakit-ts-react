import { Reply } from '@trakit/commands';
import { IBelongCompany, IRequestable, nothing, SyncName, ulong } from '@trakit/objects';
/**
 * The result of the `useSync` hook.
 */
export type UseSyncResult<T> = {
    /**
     * Whether the hook is currently loading data. This will be `true` until the initial synchronization is complete, and may briefly become `true` again if the connection is lost and re-established.
     */
    ready: boolean;
    /**
     * The list of replies received from the synchronization process.
     * This is normally not needed, but can be useful for debugging or error handling,
     * as it contains the {@link Reply} classes with {@link ErrorCode} and {@link ErrorDetail}.
     */
    replies: Reply[];
    /**
     * The list of synchronized objects of type `T`.
     */
    objects: T[];
};
/**
 * Subscribes to the given sync types for the current company, returning the
 * live list of synchronized objects and re-rendering the consumer whenever
 * that list changes.
 * @param type		The {@link SyncName} to subscribe to.
 * @param companyId	Optional company ID to filter the synchronized objects. Default is your own company.
 * @returns			An object containing the loading state, the list of replies, and the list of synchronized objects.
 */
export default function useSync<T extends IRequestable & IBelongCompany>(type: SyncName, companyId?: ulong | nothing): UseSyncResult<T>;
//# sourceMappingURL=useSync.d.ts.map