import { CookiesProvider } from 'react-cookie';
import { ReactNode } from 'react';

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
export function ConnectionProvider({ children }: { children: ReactNode }) {
	return (
		<CookiesProvider>
			{children}
		</CookiesProvider>
	);
}
