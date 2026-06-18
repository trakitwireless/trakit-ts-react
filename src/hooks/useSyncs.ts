import {
    ErrorCode,
    Reply,
    ReplySync
} from '@trakit/commands';
import {
    IBelongCompany,
    IRequestable,
    nothing,
    storage,
    SyncName,
    ulong,
} from '@trakit/objects';
import {
    TrakitEvent,
    TrakitEventSocketMessage,
    TrakitEventSync,
    TrakitSocketCommander,
} from '@trakit/sync';
import {
    useEffect,
    useRef,
    useState,
} from 'react';
import { UseSyncMultiple } from '../constants/SyncResult';
import useConnection from './useConnection';

/**
 * Subscribes to the given sync types for the current company, returning the
 * live list of synchronized objects and re-rendering the consumer whenever
 * that list changes.
 * @param types		The {@link SyncName} array to subscribe to.
 * @param companyId	Optional company ID to filter the synchronized objects. Default is your own company.
 * @returns			An object containing the loading state, the list of replies, and the list of synchronized objects.
 */
export default function useSyncs<T extends IRequestable & IBelongCompany>(
	types: SyncName[],
	companyId?: ulong | nothing
): UseSyncMultiple<T> {
	/**
	 * A reference to the current synchronization command promise.
	 * This is used to track the ongoing process between mounts and unmounts for any control using this hook.
	 * Desynchronization is only performed when the last control using this hook unmounts, so that multiple
	 * controls can use the same synchronization without interrupting each other.
	 */
	const cmd = useRef<Promise<Reply[]> | null>(null);
	/**
	 * A reference to the number of controls currently using this hook.
	 * This is used to determine when to desynchronize from the synchronization process,
	 * which only happens when the last control unmounts.
	 */
	const uses = useRef(0);
	/**
	 * The {@link Reply|replies} from the commands performing the synchronization,
	 * which may contain {@link ErrorCode}s.
	 */
	const [replies, setReplies] = useState<Reply[] | null>(null);
	/**
	 * The list of synchronized objects of type `T` for the given type and company.
	 * This array is updated whenever a full list is loaded or a single object is updated.
	 */
	const [dictionary, setDictionary] = useState<{ [key in SyncName]?: T[] | nothing }>({});
	// we use the connection hook to send sync commands
	const { synchronizer, ready, online, user, machine } = useConnection();
	// populate the companyId with default value if not provided
	companyId = companyId ?? user?.companyId ?? machine?.companyId;

	useEffect(() => {
		// if not ready, or no type is provided, or companyId is not a valid number, give up, go home
		if (!ready || !types?.length || isNaN(companyId as number)) return;
		// increments the number of uses for this hook, which is used to determine when to desynchronize
		uses.current++;

		/**
		 * Synchronizes the resource of the given type and company.
		 * @param kind The type of the resource to synchronize.
		 * @param objCompany The company ID of the resource to synchronize.
		 */
		function syncResource(kind: SyncName, objCompany: ulong) {
			if (!(
				uses.current === 0			// no longer in use (all controls unmounted)
				|| companyId !== objCompany	// wrong company object(s) sync message
				|| !types.includes(kind)	// wrong type of object(s) sync message
			)) {
				// sets the objects to the current list of objects of the given type and company in storage
				// storage is updated in the background by the commander
				setDictionary(prev => ({
					...prev,
					[kind]: [
						...(storage[kind] as Map<unknown, T>)
							.values()
							.filter(o => o.companyId === companyId as ulong)
					]
				}));
			}
		}
		/**
		 * Handles get, list, update, and delete events.
		 */
		function handleSync(event: TrakitEvent) {
			const { kind, companyId } = event as TrakitEventSync;
			syncResource(kind, companyId);
		}
		/**
		 * Handles synchronization messages by synchronizing the relevant resource.
		 */
		function handleMessage(event: TrakitEvent) {
			const { name, body } = event as TrakitEventSocketMessage;
			syncResource(
				TrakitSocketCommander.msgNameToSyncName(name) as SyncName,
				body.company as ulong
			);
		}
		/**
		 * Handles the completion of the synchronization process, cleaning up event listeners and desynchronizing if necessary.
		 */
		function handleComplete() {
			// if this is the last use of the hook
			if (uses.current === 0) {
				// desynchronize and clean up event listeners
				const desync = replies?.map(r => (r as ReplySync).syncName).filter(s => !!s);
				if (desync?.length) synchronizer.desync(companyId as ulong, desync);
				synchronizer.off("list", handleSync);
				synchronizer.off("update", handleSync);
				synchronizer.off("delete", handleSync);
				synchronizer.off("message", handleMessage);
			}
			// it's ready, so clear the command reference
			cmd.current = null;
		}
		/**
		 * Handles the main sync command response.
		 */
		function handlePromise(responses: Reply[]) {
			setReplies(responses);
			types.forEach(type => syncResource(type, companyId as ulong));
		}

		// attach event listeners for events, sync messages, and start the synchronizing
		synchronizer.on("list", handleSync);
		synchronizer.on("update", handleSync);
		synchronizer.on("delete", handleSync);
		synchronizer.on("message", handleMessage);
		cmd.current = synchronizer.sync(companyId as ulong, types);
		cmd.current.then(handlePromise, handlePromise);
		cmd.current.finally(handleComplete);

		return () => {
			// decrements the number of uses and desynchronizes if this is the last use
			uses.current--;
			if (!cmd.current) {
				// if command has completed, desynchronize immediately
				handleComplete();
			}
		};
	}, [companyId, types.sort().join(",")]);

	return {
		ready: ready
			&& online
			&& !!Object.keys(dictionary).length
			&& !cmd.current,
		replies: replies ?? [],
		...dictionary,
	};
}