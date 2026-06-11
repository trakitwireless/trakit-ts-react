'use client';

import {
    Reply,
    ReplySync
} from '@trakit/commands';
import {
    IBelongCompany,
    IRequestable,
    nothing,
    storage,
    SyncName,
    ulong
} from '@trakit/objects';
import {
    TrakitEvent,
    TrakitEventSocketMessage,
    TrakitEventSync,
    TrakitSocketCommander
} from '@trakit/sync';
import {
    useEffect,
    useRef,
    useState
} from 'react';
import useConnection from './useConnection';

/**
 * 
 */
export type UseSyncResult<T> = {
	loading: boolean;
	replies: Reply[];
	objects: T[];
};

/**
 * Subscribes to the given sync types for the current company, returning the
 * live list of synchronized objects and re-rendering the consumer whenever
 * that list changes.
 * @param type The {@link SyncName} to subscribe to.
 * @returns `{ loading, replies, objects }` – typed to whatever `T` is inferred or provided.
 */
export default function useSync<T extends IRequestable & IBelongCompany>(type: SyncName): UseSyncResult<T> {
	const cmd = useRef<Promise<Reply[]> | null>(null);
	const uses = useRef(0);
	const [replies, setReplies] = useState<Reply[] | null>(null);
	const [objects, setObjects] = useState<T[] | null>(null);
	const { synchronizer: sync, initialized, online, user, machine } = useConnection();
	const companyId = user?.companyId ?? machine?.companyId;
	let ranEffect = false;

	useEffect(() => {
		if (!initialized || !type || isNaN(companyId as number)) return;
		uses.current++;

		/**
		 * 
		 */
		function syncResource(kind: SyncName, objCompany: ulong) {
			if (!(
				uses.current === 0			// no longer in use
				|| companyId !== objCompany	// wrong company object(s) sync message
				|| type !== kind			// wrong type of object(s) sync message
			)) {
				// sets the obejcts to the current list of objects of the given type and company in storage
				// storage is updated in the background by the commander
				setObjects([
					...(storage[kind] as Map<unknown, T>)
						.values()
						.filter(o => o.companyId === companyId as ulong)
				]);
			}
		}
		/**
		 * 
		 */
		function handleSync(event: TrakitEvent) {
			const { kind, companyId } = event as TrakitEventSync;
			syncResource(kind, companyId);
		}
		/**
		 * 
		 */
		function handleMessage(event: TrakitEvent) {
			const { name, body } = event as TrakitEventSocketMessage;
			syncResource(
				TrakitSocketCommander.msgNameToSyncName(name) as SyncName,
				body.company as ulong
			);
		}
		/**
		 * 
		 */
		function handleComplete() {
			if (uses.current === 0) {
				const toDesync = replies?.map(r => (r as ReplySync).syncName).filter(s => !!s);
				if (toDesync?.length) sync.desync(companyId as ulong, toDesync);
				sync.off("list", handleSync);
				sync.off("update", handleSync);
				sync.off("delete", handleSync);
				sync.off("message", handleMessage);
			}
			cmd.current = null;
		}
		/**
		 * 
		 */
		function handlePromise(responses: Reply[]) {
			setReplies(responses);
			syncResource(type, companyId as ulong);
		}

		sync.on("list", handleSync);
		sync.on("update", handleSync);
		sync.on("delete", handleSync);
		sync.on("message", handleMessage);
		cmd.current = sync.sync(companyId as ulong, [type]);
		cmd.current.then(handlePromise, handlePromise);
		cmd.current.finally(handleComplete);
		ranEffect = true;

		return () => {
			uses.current--;
			if (!cmd.current) {
				handleComplete();
			}
		};
	}, [initialized, online, companyId, type]);

	return {
		loading: !ranEffect
			&& !objects
			|| !!cmd.current,
		replies: replies ?? [],
		objects: objects ?? [],
	};
}