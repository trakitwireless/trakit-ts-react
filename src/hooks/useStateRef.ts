import {
    useRef,
    useState
} from 'react';

export function useStateRef<T>(initial: T) {
	const ref = useRef<T>(initial);
	const [state, setState] = useState<T>(ref.current);
	return [state, setState, ref] as const;
}