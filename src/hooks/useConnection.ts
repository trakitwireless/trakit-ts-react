'use client';

import { RepSelfGet } from '@trakit/commands';
import {
    guid,
    Machine,
    nothing,
    User
} from '@trakit/objects';
import {
    TrakitEvent,
    TrakitEventAccount,
    TrakitEventSocketState,
    TrakitSyncCommander
} from '@trakit/sync';
import {
    useEffect, useRef,
    useState
} from 'react';

/**
 * 
 */
export default function useConnection() {
	/**
	 * 
	 */
	const s = useRef<TrakitSyncCommander>(new TrakitSyncCommander(
		new RepSelfGet,
		process.env.NEXT_PUBLIC_TRAKIT_REST_ADDRESS,
		process.env.NEXT_PUBLIC_TRAKIT_SOCKET_ADDRESS
	));
	/**
	 * 
	 */
	const [online, setOnline] = useState(s.current.socketOnline);
	/**
	 * 
	 */
	const [ghostId, setGhostId] = useState<guid | nothing>(s.current.account.ghostId);
	/**
	 * 
	 */
	const [user, setUser] = useState<User | nothing>(s.current.account.user);
	/**
	 * 
	 */
	const [machine, setMachine] = useState<Machine | nothing>(s.current.account.machine);
	/**
	 * 
	 */
	const initialized = isNaN(s.current.account.serverTime.valueOf())
		? !ghostId
		: !!(user?.login || machine?.key);

	/**
	 * 
	 */
	useEffect(() => {
		function handleOnline(event: TrakitEvent) {
			setOnline((event as TrakitEventSocketState).online);
		}
		function handleAccount(event: TrakitEvent) {
			const { account: a } = event as TrakitEventAccount;
			setGhostId(
				a.user?.login && a.expiry > new Date
					? a.ghostId
					: undefined
			);
			setUser(a.user);
			setMachine(a.machine);
		}

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
		}
	}, []);

	return {
		online,
		initialized,
		sync: s.current,
		ghostId,
		user,
		machine,
	};
}