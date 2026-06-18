import {
    ErrorCode,
    ErrorDetail,
    Reply
} from '@trakit/commands';
import {
    IBelongCompany,
    IRequestable,
    SyncName,
    nothing,
} from '@trakit/objects';

/**
 * The result of the `useSync` hook.
 */
export interface UseSyncResult {
	/**
	 * Whether the hook is currently loading data. This will be `true` until the initial synchronization is complete, and may briefly become `true` again if the connection is lost and re-established.
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
 */
export type UseSyncMultiple<T extends (IRequestable & IBelongCompany)> = UseSyncResult & {
	/**
	 * The list of synchronized objects of type `T`.
	 */
	[key in SyncName]?: T[] | nothing;
}
/**
 * The result of the `useSync` hook.
 */
export type UseSyncSingle<T extends (IRequestable & IBelongCompany)> = UseSyncResult & {
	/**
	 * The list of synchronized objects of type `T`.
	 */
	objects: T[] | nothing;
}