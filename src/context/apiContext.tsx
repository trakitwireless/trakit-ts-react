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
    TrakitAuditCommander,
    TrakitEvent,
    TrakitEventAccount,
    TrakitEventSocketState,
    //TrakitHostingCommander,
    //TrakitImageCommander,
    //TrakitModemCommander,
    //TrakitReportCommander,
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
export type TrakitContextType = {
	/**
	 * The synchronizer instance used for commands.
	 */
	readonly synchronizer: TrakitSyncCommander;
	/**
	 * The auditor instance used for history.
	 */
	readonly auditor: TrakitAuditCommander;
	///**
	// * The auditor instance used for history.
	// */
	//readonly imager: TrakitImageCommander;
	///**
	// * The auditor instance used for history.
	// */
	//readonly reporter: TrakitReportCommander;
	///**
	// * The auditor instance used for history.
	// */
	//readonly provisioner: TrakitModemCommander;
	///**
	// * The auditor instance used for history.
	// */
	//readonly hosting: TrakitHostingCommander;

	/**
	 * Indicates whether the APIs are ready for use.
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
 * The React context that provides the connection state and API instances.
 * This context is used by the `useTrakit` hook to access APIs and connection information.
 * It should be provided by the `TrakitProvider` component at a higher level in the component tree.
 */
const TrakitContext = createContext<TrakitContextType | null>(null);

/**
 * Provider component that wraps the application with CookiesProvider.
 * Required for the `useTrakit` hook to work properly.
 * 
 * @example
 * ```tsx
 * import { TrakitProvider, useTrakit } from '@trakit/react';
 * 
 * function App() {
 *   return (
 *     <TrakitProvider>
 *       <YourComponent />
 *     </TrakitProvider>
 *   );
 * }
 * ```
 */	
export function TrakitProvider({
	children,
	restAddress,
	socketAddress,
	auditAddress,
	//imageAddress,
	//reportAddress,
	//modemAddress,
	//hostingAddress,
}: {
	children: ReactNode;
	restAddress?: URL | url | nothing;
	socketAddress?: URL | url | nothing;
	auditAddress?: URL | url | nothing;
	//imageAddress?: URL | url | nothing;
	//reportAddress?: URL | url | nothing;
	//modemAddress?: URL | url | nothing;
	//hostingAddress?: URL | url | nothing;
}) {
	//console.log("TrakitProvider", {
	//	restAddress,
	//	socketAddress,
	//});
	return (
		<CookiesProvider>
			<TrakitInner
				restAddress={restAddress}
				socketAddress={socketAddress}
				auditAddress={auditAddress}
			//	imageAddress={imageAddress}
			//	reportAddress={reportAddress}
			//	modemAddress={modemAddress}
			//	hostingAddress={hostingAddress}
			>
				{children}
			</TrakitInner>
		</CookiesProvider>
	);
}
/**
 * Inner provider component that manages the connection state and API instances.
 * This component is used internally by the `TrakitProvider` and should not be used directly.
 * It initializes the synchronizer, listens for connection and account events,
 * and provides the current connection state and user/machine information.
 */
function TrakitInner({
	children,
	restAddress,
	socketAddress,
	auditAddress,
	//imageAddress,
	//reportAddress,
	//modemAddress,
	//hostingAddress,
}: {
	children: ReactNode;
	restAddress?: URL | url | nothing;
	socketAddress?: URL | url | nothing;
	auditAddress?: URL | url | nothing;
	//imageAddress?: URL | url | nothing;
	//reportAddress?: URL | url | nothing;
	//modemAddress?: URL | url | nothing;
	//hostingAddress?: URL | url | nothing;
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
	 * The auditor instance used for history.
	 */
	const a = useRef(new TrakitAuditCommander(
		null,
		auditAddress || TrakitAuditCommander.URI_PROD,
	));
	///**
	// * The auditor instance used for history.
	// */
	//const i = useRef(new TrakitImageCommander(
	//	null,
	//	imageAddress || TrakitImageCommander.URI_PROD,
	//));
	///**
	// * The auditor instance used for history.
	// */
	//const r = useRef(new TrakitReportCommander(
	//	null,
	//	reportAddress || TrakitReportCommander.URI_PROD,
	//));
	///**
	// * The auditor instance used for history.
	// */
	//const m = useRef(new TrakitModemCommander(
	//	null,
	//	modemAddress || TrakitModemCommander.URI_PROD,
	//));
	///**
	// * The auditor instance used for history.
	// */
	//const f = useRef(new TrakitHostingCommander(
	//	null,
	//	hostingAddress || TrakitHostingCommander.URI_PROD,
	//));

	/**
	 * The cookies for {@link RepSelfGet.ghostId}, {@link Machine.key}, and {@link Machine.secret}.
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
	 * Indicates whether the APIs are ready for use.
	 */
	const ready = !!(ghostId || machine) === !!(s.current.account.user || s.current.account.machine);

	//console.log("TrakitInner", {
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

		// dependant APIs
		a.current.setAuth(account);
		//i.current.setAuth(account);
		//r.current.setAuth(account);
		//m.current.setAuth(account);
		//f.current.setAuth(account);
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
		<TrakitContext value={{
			synchronizer: s.current,
			auditor: a.current,
			//imager: i.current,
			//reporter: r.current,
			//provisioner: m.current,
			//hosting: f.current,
			ready,
			ghostId,
			online,
			user,
			machine,
		}}>
			{children}
		</TrakitContext>
	);
}

/**
 * A React hook that manages the connection to the Trak-iT synchronization service and APIs.
 * It initializes the synchronizer, listens for connection and account events,
 * and provides the current connection state, API instances, and user/machine information.
 */
export function useTrakit() { 
    const ctx = useContext(TrakitContext);
    if (!ctx) throw new Error('useTrakit must be used within TrakitProvider');
    return ctx;
}