import { SocketResponseError } from '@rlanz/socket';
import type { AuthenticatedSocket } from '@rlanz/socket/types';

import type User from '#users/user';

let nextSocketId = 0;

/**
 * Minimal socket as seen by a channel handler. The raw connection is never
 * used by channels, hence the empty stand-in.
 */
export function createFakeChannelSocket(
	user: User | undefined
): AuthenticatedSocket<User> {
	nextSocketId += 1;
	return {
		id: `fake-socket-${nextSocketId}`,
		user,
		getUserOrFail: () => {
			if (!user) throw new SocketResponseError('Unauthorized');
			return user;
		},
		emit: () => undefined,
		disconnect: () => undefined,
		raw: {
			id: `fake-socket-${nextSocketId}`,
			data: {},
			connection: Object.create(null),
		},
	};
}
