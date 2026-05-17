import { vi, afterEach } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn()
	}))
});

const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
	value: localStorageMock
});

// SvelteKit navigation mocks
vi.mock('$app/navigation', () => ({
	goto: vi.fn(),
	beforeNavigate: vi.fn(),
	afterNavigate: vi.fn(),
	invalidate: vi.fn(),
	invalidateAll: vi.fn(),
	preloadData: vi.fn(),
	preloadCode: vi.fn()
}));

vi.mock('$app/stores', () => ({
	page: {
		subscribe: vi.fn((fn: (value: unknown) => void) => {
			fn({
				url: new URL('http://localhost:5173'),
				params: {},
				route: { id: null },
				status: 200,
				error: null,
				form: null,
				data: {}
			});
			return () => {};
		})
	},
	navigating: {
		subscribe: vi.fn((fn: (value: unknown) => void) => {
			fn(null);
			return () => {};
		})
	},
	updated: {
		subscribe: vi.fn((fn: (value: unknown) => void) => {
			fn(false);
			return () => {};
		})
	}
}));

// Clean up after each test
afterEach(() => {
	vi.clearAllMocks();
});
