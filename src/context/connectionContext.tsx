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
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { CookiesProvider, useCookies } from 'react-cookie';
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
export type ConnectionContextType = {
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
 * The React context that provides the connection state and synchronizer instance.
 * This context is used by the `useConnection` hook to access connection information.
 * It should be provided by the `ConnectionProvider` component at a higher level in the component tree.
 */
const ConnectionContext = createContext<ConnectionContextType | null>(null);

/**
 * Provider component that wraps the application with CookiesProvider.
 * Required for the `useConnection` hook to work properly.
 * 
 * @example
 * ```tsx
 * import { ConnectionProvider, useConnection } from '@trakit/react';
 * 
 * function App() {
 *   return (
 *     <ConnectionProvider>
 *       <YourComponent />
 *     </ConnectionProvider>
 *   );
 * }
 * ```
 */	
export function ConnectionProvider({
	children,
	restAddress,
	socketAddress
}: {
	children: ReactNode;
	restAddress?: URL | url | nothing;
	socketAddress?: URL | url | nothing;
}) {
	//console.log("ConnectionProvider", {
	//	restAddress,
	//	socketAddress,
	//});
	return (
		<CookiesProvider>
			<ConnectionProviderInner
				restAddress={restAddress}
				socketAddress={socketAddress}
			>
				{children}
			</ConnectionProviderInner>
		</CookiesProvider>
	);
}
/**
 * Inner provider component that manages the connection state and synchronizer instance.
 * This component is used internally by the `ConnectionProvider` and should not be used directly.
 * It initializes the synchronizer, listens for connection and account events,
 * and provides the current connection state and user/machine information.
 */
function ConnectionProviderInner({
	children,
	restAddress,
	socketAddress,
}: {
	children: ReactNode;
	restAddress?: URL | url | nothing;
	socketAddress?: URL | url | nothing;
}) {
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
	const ready = !!(ghostId || machine) === !!(s.current.account.user || s.current.account.machine);

	//console.log("ConnectionInner", {
	//	ready,
	//	online,
	//	ghostId,
	//	machine,
	//	user
	//});

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
	}, []);

	return (
		<ConnectionContext value={{
			synchronizer: s.current,
			ready,
			ghostId,
			online,
			user,
			machine,
		}}>
			{children}
		</ConnectionContext>
	);
}

/**
 * A React hook that manages the connection to the Trak-iT synchronization service.
 * It initializes the synchronizer, listens for connection and account events,
 * and provides the current connection state and user/machine information.
 */
export function useConnection() { 
    const ctx = useContext(ConnectionContext);
    if (!ctx) throw new Error('useConnection must be used within ConnectionProvider');
    return ctx;
}