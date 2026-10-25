import { useCallback, useState } from 'react';

import {
	readAutoStartPreference,
	writeAutoStartPreference,
} from './auto_start_preference';

type UseAutoStartPreferenceReturn = readonly [
	isAutoStartEnabled: boolean,
	setAutoStartEnabled: (isEnabled: boolean) => void,
];

export function useAutoStartPreference(): UseAutoStartPreferenceReturn {
	const [isAutoStartEnabled, setIsAutoStartEnabled] = useState(() =>
		readAutoStartPreference()
	);

	const setAutoStartEnabled = useCallback((isEnabled: boolean) => {
		setIsAutoStartEnabled(isEnabled);
		writeAutoStartPreference(isEnabled);
	}, []);

	return [isAutoStartEnabled, setAutoStartEnabled];
}
