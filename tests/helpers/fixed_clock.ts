import type { DateTime } from 'luxon';

import { Clock } from '#shared/clock';

/** A clock that tells the time a spec decided, and can be moved. */
export class FixedClock extends Clock {
	constructor(private current: DateTime) {
		super();
	}

	override now(): DateTime {
		return this.current;
	}

	moveTo(instant: DateTime): void {
		this.current = instant;
	}
}
