import {
    RepSelfGet,
} from '@trakit/commands';
import {
    guid,
    Machine,
    nothing,
    url,
    User,
} from '@trakit/objects';
import {
    TrakitEvent,
    TrakitEventAccount,
    TrakitEventSocketState,
    TrakitRestfulCommander,
    TrakitSocketCommander,
    TrakitSyncCommander,
} from '@trakit/sync';
import {
    useEffect,
    useRef,
    useState,
} from 'react';

/**
 * The result of the `useConnection` hook, providing the synchronizer instance and connection state.
 */
export type UseConnectionResult = {
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
 * A React hook that manages the connection to the Trak-iT synchronization service.
 * It initializes the synchronizer, listens for connection and account events,
 * and provides the current connection state and user/machine information.
 */
export default function useConnection(
	restAddress?: URL | url | nothing,
	socketAddress?: URL | url | nothing,
): UseConnectionResult {
	/**
	 * The synchronizer instance used for commands.
	 */
	const s = useRef(new TrakitSyncCommander(
		null,
		restAddress || TrakitRestfulCommander.URI_PROD,
		socketAddress || TrakitSocketCommander.URI_PROD,
	));

	/**
	 * Indicates whether the WebSocket connection is currently online.
	 */
	const [online, setOnline] = useState(s.current.socketOnline);
	/**
	 * The session ID taken from a login command.
	 */
	const [ghostId, setGhostId] = useState<guid>(s.current.account.ghostId || "");
	/**
	 * The {@link User} information associated with the current session, if available.
	 */
	const [user, setUser] = useState<User | null>(s.current.account.user || null);
	/**
	 * The {@link Machine|API credentials} associated with the current session, if available.
	 */
	const [machine, setMachine] = useState<Machine | null>(s.current.account.machine || null);
	/**
	 * Indicates whether the connection is ready for use.
	 */
	const ready = online === !!(ghostId || machine);

	/**
	 * Handles online/offline events from the WebSocket connection.
	 * @param event
	 */
	function handleOnline(event: TrakitEvent) {
		setOnline((event as TrakitEventSocketState).online);
	}
	/**
	 * Handles changes to the account information, updating the ghost ID, user, and machine state accordingly.
	 * @param event
	 */
	function handleAccount(event: TrakitEvent) {
		const { account: a } = event as TrakitEventAccount;
		setGhostId(
			a.user?.login && a.expiry > new Date
				? a.ghostId
				: ""
		);
		setUser(a.user || null);
		setMachine(a.machine || null);
	}

	/**
	 * Sets up event listeners for the WebSocket connection and account changes.
	 * Also initializes the REST and WebSocket addresses for the synchronizer.
	 */
	useEffect(() => {
		s.current.on("open", handleOnline);
		s.current.on("error", handleOnline);
		s.current.on("close", handleOnline);
		s.current.on("account", handleAccount);
		return () => {
			s.current.off("open", handleOnline);
			s.current.off("error", handleOnline);
			s.current.off("close", handleOnline);
			s.current.off("account", handleAccount);
			s.current.dispose();
		};
	}, []);

	return {
		synchronizer: s.current,
		ready,
		ghostId,
		online,
		user,
		machine,
	};
}