export interface DebouncedFunction<T extends (...args: unknown[]) => void> {
	(...args: Parameters<T>): void;
	flush?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): DebouncedFunction<T> {
	let timeoutId: ReturnType<typeof setTimeout>;
	const debounced = (...args: Parameters<T>) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), delay);
	};
	debounced.flush = () => {
		clearTimeout(timeoutId);
	};
	return debounced;
}
