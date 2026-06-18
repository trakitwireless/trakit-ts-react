import { Reply } from '@trakit/commands';
import { IBelongCompany, IRequestable, nothing, SyncName, ulong } from '@trakit/objects';
/**
 * The result of the `useSync` hook and `useSingle` hook.
 */
export interface UseSyncResult {
    /**
     * Whether the hook is currently loading data. This will be `true` until the initial synchronization
     * is complete, and may briefly become `true` again if the connection is lost and re-established.
     */
    ready: boolean;
    /**
     * The list of replies received from the synchronization process.
     * This is normally not needed, but can be useful for debugging or error handling,
     * as it contains the {@link Reply} classes with {@link ErrorCode} and {@link ErrorDetail}.
     */
    replies: Reply[] | null;
}
/**
 * The result of the `useSync` hook.
 * This object behaves like a dictionary, where the {@link UseSyncResult} properties are combined with
 * the synchronized objects of type `T` for each requested types.
 */
export type UseSyncMultiple<T extends IRequestable & IBelongCompany> = UseSyncResult & {
    [key in SyncName]?: T[] | nothing;
};
/**
 * The result of the `useSingle` hook.
 * This is a combination of the {@link UseSyncResult} and the synchronized objects of type `T`
 * for the given type, which are stored in an array.
 */
export type UseSyncSingle<T extends IRequestable & IBelongCompany> = UseSyncResult & {
    /**
     * The list of synchronized objects of the requested type.
     */
    objects: T[] | nothing;
};
/**
 * Subscribes to the given sync types for the given company, returning the live list of synchronized
 * objects and re-rendering whenever any object, or part of that list changes.
 * @param types		The {@link SyncName} array to subscribe to.
 * @param companyId	Optional company ID to filter the synchronized objects. Default is your own company.
 * @returns			An object containing the loading state, the list of replies, and the list(s) of synchronized objects.
 */
export declare function useSync<T extends IRequestable & IBelongCompany>(types: SyncName[], companyId?: ulong | nothing): UseSyncMultiple<T>;
/**
 * Subscribes to the given sync type for the given company, returning the live list of synchronized
 * objects and re-rendering whenever any object, or part of that list changes.
 * @param type		The {@link SyncName} to subscribe to.
 * @param companyId	Optional company ID to filter the synchronized objects. Default is your own company.
 * @returns			An object containing the loading state, the list of replies, and the list of synchronized objects.
 */
export declare function useSingle<T extends IRequestable & IBelongCompany>(type: SyncName, companyId?: ulong | nothing): UseSyncSingle<T>;
//# sourceMappingURL=useSync.d.ts.map