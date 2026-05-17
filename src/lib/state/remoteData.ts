export type RemoteData<D, E = Error> =
	| { status: 'notAsked' }
	| { status: 'loading' }
	| { status: 'success'; data: D }
	| { status: 'failure'; error: E };

export function notAsked<D, E = Error>(): RemoteData<D, E> {
	return { status: 'notAsked' };
}

export function loading<D, E = Error>(): RemoteData<D, E> {
	return { status: 'loading' };
}

export function success<D, E = Error>(data: D): RemoteData<D, E> {
	return { status: 'success', data };
}

export function failure<D, E = Error>(error: E): RemoteData<D, E> {
	return { status: 'failure', error };
}

export function isSuccess<D, E>(rd: RemoteData<D, E>): rd is { status: 'success'; data: D } {
	return rd.status === 'success';
}

export function isFailure<D, E>(rd: RemoteData<D, E>): rd is { status: 'failure'; error: E } {
	return rd.status === 'failure';
}

export function isLoading<D, E>(rd: RemoteData<D, E>): rd is { status: 'loading' } {
	return rd.status === 'loading';
}

export function isNotAsked<D, E>(rd: RemoteData<D, E>): rd is { status: 'notAsked' } {
	return rd.status === 'notAsked';
}

export function mapSuccess<D, E, R>(
	rd: RemoteData<D, E>,
	transform: (data: D) => R
): RemoteData<R, E> {
	if (isSuccess(rd)) {
		return success(transform(rd.data));
	}
	return rd as RemoteData<R, E>;
}
