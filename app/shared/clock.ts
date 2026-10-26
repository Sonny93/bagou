import { DateTime } from 'luxon';

/** Source of the current time, replaceable in specs. */
export class Clock {
	now(): DateTime {
		return DateTime.now();
	}
}
