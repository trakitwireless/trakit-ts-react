'use client';

import { RepSelfGet } from '@trakit/commands';
import {
    guid,
    Machine,
    nothing,
    url,
    User
} from '@trakit/objects';
import {
    TrakitEvent,
    TrakitEventAccount,
    TrakitEventSocketState,
    TrakitRestfulCommander,
    TrakitSocketCommander,
    TrakitSyncCommander
} from '@trakit/sync';
import {
RefObject,
	useEffect,
	useRef,
    useState
} from 'react';

/**
 * 
 */
export type UseConnectionResult = {
	online: boolean;
	initialized: boolean;
	synchronizer: TrakitSyncCommander;
	ghostId: guid | nothing;
	user: User | nothing;
	machine: Machine | nothing;
};

/**
 * 
 */
export default function useConnection(
	restAddress: URL | url = TrakitRestfulCommander.URI_PROD,
	socketAddress: URL | url = TrakitSocketCommander.URI_PROD,
): UseConnectionResult {
	/**
	 * 
	 */
	const s = useRef(new TrakitSyncCommander);
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
	 * @param event
	 */
	function handleOnline(event: TrakitEvent) {
		setOnline((event as TrakitEventSocketState).online);
	}
	/**
	 * 
	 * @param event
	 */
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

	/**
	 * 
	 */
	useEffect(() => {
		s.current.on("open", handleOnline);
		s.current.on("error", handleOnline);
		s.current.on("close", handleOnline);
		s.current.on("account", handleAccount);
		s.current.restAddress = new URL(restAddress);
		s.current.socketAddress = new URL(socketAddress);
		return () => {
			s.current.off("open", handleOnline);
			s.current.off("error", handleOnline);
			s.current.off("close", handleOnline);
			s.current.off("account", handleAccount);
			s.current.dispose();
		};
	}, [restAddress, socketAddress]);

	return {
		online,
		initialized,
		synchronizer: s.current,
		ghostId,
		user,
		machine,
	};
}