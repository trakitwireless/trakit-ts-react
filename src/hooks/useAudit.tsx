import {
    RepSelfGet,
} from '@trakit/commands';
import {
    guid,
    Machine,
    nothing,
    url
} from '@trakit/objects';
import {
    TrakitAuditCommander,
} from '@trakit/sync';
import {
    useEffect,
    useRef
} from 'react';

/**
 * 
 * @param account The account information used for authentication.
 * @param baseAddress The base address of the audit service.
 * @returns An object containing the auditor instance and its readiness state.
 */
export function useAudit(
	account?: RepSelfGet | { machine: { key: string } }
			| Machine | { key: string }
			| { ghostId: guid }
			| guid
			| nothing,
	baseAddress?: URL | url | nothing
) {
	/**
	 * The auditor instance used for commands.
	 */
	const a = useRef(new TrakitAuditCommander(
		null,
		baseAddress || TrakitAuditCommander.URI_PROD
	));
	/**
	 * Indicates whether the connection is ready for use.
	 */
	const ready = !!(a.current.account.user || a.current.account.machine);

	// if the account changes, update the auditor's account
	useEffect(
		() => a.current.setAuth(account),
		[
			(account as RepSelfGet)?.user?.login
			?? (account as { machine?: { key: string } })?.machine?.key	// also matches RepSelfGet
			?? (account as { key: string })?.key
			?? account
			?? null
		]
	);

	return {
		audit: a.current,
		ready,
	};
}