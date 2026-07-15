import { RepSelfGet } from '@trakit/commands';
import { guid, Machine, nothing, url } from '@trakit/objects';
import { TrakitAuditCommander } from '@trakit/sync';
/**
 *
 * @param account The account information used for authentication.
 * @param baseAddress The base address of the audit service.
 * @returns An object containing the auditor instance and its readiness state.
 */
export declare function useAudit(account?: RepSelfGet | {
    machine: {
        key: string;
    };
} | Machine | {
    key: string;
} | {
    ghostId: guid;
} | guid | nothing, baseAddress?: URL | url | nothing): {
    auditor: TrakitAuditCommander;
    ready: boolean;
};
//# sourceMappingURL=useAudit.d.ts.map