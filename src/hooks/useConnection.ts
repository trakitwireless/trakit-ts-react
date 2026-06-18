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
import { useCookies } from 'react-cookie';
import { CookieSetOptions } from 'universal-cookie';

/**
 * Name of the session ID cookie.
 * This cookie is used to persist the user's session across page reloads and browser restarts.
 */
const SESSION_ID = "ghostId";
/**
 * Name of the machine key cookie.
 * This cookie is used to persist the machine's key across page reloads and browser restarts.
 */
const MACHINE_KEY = "aK";
/**
 * Name of the machine secret cookie.
 * This cookie is used to persist the machine's secret across page reloads and browser restarts.
 */
const MACHINE_SECRET = "aS";
/**
 * Default options for setting cookies.
 * These options ensure that cookies are only accessible via the client-side and are secure.
 */
const COOKIE_OPTIONS: CookieSetOptions = {
	path: "/",
	secure: true,
	sameSite: 'strict',
	expires: new Date(0),	// default to expired; should be overridden with actual expiry when setting cookies
};

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
	 * The cookies for session ID, {@link Machine.key}, and {@link Machine.secret}.
	 */
	const [cookies, setCookie, removeCookie] = useCookies([SESSION_ID, MACHINE_KEY, MACHINE_SECRET]);
	/**
	 * Indicates whether the WebSocket connection is currently online.
	 */
	const [online, setOnline] = useState(s.current.socketOnline);
	/**
	 * The session ID taken from a login command.
	 */
	const [ghostId, setGhostId] = useState<guid>(cookies[SESSION_ID] || "");
	/**
	 * The {@link User} information associated with the current session, if available.
	 */
	const [user, setUser] = useState<User | null>(s.current.account.user || null);
	/**
	 * The {@link Machine|API credentials} associated with the current session, if available.
	 */
	const [machine, setMachine] = useState<Machine | null>(
		s.current.account.machine
		|| cookies[MACHINE_KEY] && new Machine({
			key: cookies[MACHINE_KEY],
			secret: cookies[MACHINE_SECRET],
		})
		|| null
	);
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
		const { account } = event as TrakitEventAccount;

		if (account.user?.login && account.expiry > new Date) {
			setCookie(SESSION_ID, account.ghostId, {
				...COOKIE_OPTIONS,
				expires: account.expiry,
			});
			setGhostId(account.ghostId || "");
		} else {
			removeCookie(SESSION_ID, COOKIE_OPTIONS);
		}
		setUser(account.user || null);

		if (account.machine?.key && account.expiry > new Date) {
			setCookie(MACHINE_KEY, account.machine.key, {
				...COOKIE_OPTIONS,
				expires: account.expiry,
			});
			setCookie(MACHINE_SECRET, account.machine.secret, {
				...COOKIE_OPTIONS,
				expires: account.expiry,
			});
		} else {
			removeCookie(MACHINE_KEY, COOKIE_OPTIONS);
			removeCookie(MACHINE_SECRET, COOKIE_OPTIONS);
		}
		setMachine(account.machine || null);
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
		if (ghostId || machine) {
			s.current.setAuth({
				ghostId,
				machine: machine?.toJSON(),
			});
		}
		return () => s.current.dispose();
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