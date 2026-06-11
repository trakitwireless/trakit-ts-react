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
 * Subscribes to the given sync types for the current company, returning the
 * live list of synchronized objects and re-rendering the consumer whenever
 * that list changes.  No Context.Provider is required.
 * @param type The {@link SyncName} to subscribe to.
 * @returns `{ loading, replies, objects }` – typed to whatever `T` is inferred or provided.
 */
export default function useSync<T extends IRequestable & IBelongCompany>(type: SyncName) {
	const { sync, initialized, online, user, machine } = useConnection();
	const companyId = user?.companyId ?? machine?.companyId;
	const command = useRef<Promise<Reply[]> | null>(null);
	const didUnmount = useRef(false);
	const [replies, setReplies] = useState<Reply[] | null>(null);
	const [objects, setObjects] = useState<T[] | null>(null);
	let ranEffect = false;

	useEffect(() => {
		if (isNaN(companyId as number) || !type) return;
		didUnmount.current = false;
		if (command.current) return;

		function syncResource(kind: SyncName, objCompany: ulong) {
			//console.log("syncResource:", kind, objCompany);
			if (
				didUnmount.current
				|| companyId !== objCompany
				|| type !== kind
			) return;
			setObjects([
				...(storage[kind] as Map<unknown, T>)
					.values()
					.filter(o => o.companyId === companyId as ulong)
			]);
		}
		function handleSync(event: TrakitEvent) {
			//console.log("handleSync:", event);
			const { kind, companyId } = event as TrakitEventSync;
			syncResource(kind, companyId);
		}
		function handleMessage(event: TrakitEvent) {
			//console.log("handleMessage:", event);
			const { name, body } = event as TrakitEventSocketMessage;
			syncResource(
				TrakitSocketCommander.msgNameToSyncName(name) as SyncName,
				body.company as ulong
			);
		}
		function handleDispose() {
			//console.log("handleDispose", didUnmount.current);
			if (didUnmount.current) {
				const toDesync = replies?.map(r => (r as ReplySync).syncName).filter(s => !!s);
				if (toDesync?.length) sync.desync(companyId as ulong, toDesync);
				sync.off("list", handleSync);
				sync.off("update", handleSync);
				sync.off("delete", handleSync);
				sync.off("message", handleMessage);
			}
			command.current = null;
		}
		function handlePromise(responses: Reply[]) {
			//console.log("handlePromise:", responses);
			setReplies(responses);
			syncResource(type, companyId as ulong);
		}

		sync.on("list", handleSync);
		sync.on("update", handleSync);
		sync.on("delete", handleSync);
		sync.on("message", handleMessage);
		command.current = sync.sync(companyId as ulong, [type]);
		command.current.then(handlePromise, handlePromise);
		command.current.finally(handleDispose);
		ranEffect = true;

		return () => {
			didUnmount.current = true;
			if (!command.current) {
				handleDispose();
			}
		};
	}, [initialized, online, companyId, type]);

	return {
		loading: !ranEffect
			&& !objects
			|| !!command.current,
		replies: replies ?? [],
		objects: objects ?? [],
	};
}