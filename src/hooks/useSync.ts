import {
    IBelongCompany,
    IRequestable,
    nothing,
    SyncName,
    ulong
} from '@trakit/objects';
import { UseSyncSingle } from '../constants/SyncResult';
import useSyncs from './useSyncs';

/**
 * Subscribes to the given sync types for the current company, returning the
 * live list of synchronized objects and re-rendering the consumer whenever
 * that list changes.
 * @param type		The {@link SyncName} to subscribe to.
 * @param companyId	Optional company ID to filter the synchronized objects. Default is your own company.
 * @returns			An object containing the loading state, the list of replies, and the list of synchronized objects.
 */
export default function useSingle<T extends IRequestable & IBelongCompany>(
	type: SyncName,
	companyId?: ulong | nothing
): UseSyncSingle<T> {
	/**
	 * 
	 */
	const { ready, replies, [type]: objects } = useSyncs([type], companyId);

	return {
		ready: ready,
		replies: replies,
		objects: (objects ?? []) as T[],
	};
}