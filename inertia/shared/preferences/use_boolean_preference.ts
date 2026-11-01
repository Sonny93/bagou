import { useCallback, useState } from 'react';

import {
	readBooleanPreference,
	writeBooleanPreference,
	type BooleanPreference,
} from './boolean_preference';

type UseBooleanPreferenceReturn = readonly [
	isEnabled: boolean,
	setEnabled: (isEnabled: boolean) => void,
];

/** A per-device on/off setting, saved as soon as it changes. */
export function useBooleanPreference(
	preference: Readonly<BooleanPreference>
): UseBooleanPreferenceReturn {
	const [isEnabled, setIsEnabled] = useState(() =>
		readBooleanPreference(preference)
	);

	const setEnabled = useCallback(
		(nextIsEnabled: boolean) => {
			setIsEnabled(nextIsEnabled);
			writeBooleanPreference(preference, nextIsEnabled);
		},
		[preference]
	);

	return [isEnabled, setEnabled];
}
