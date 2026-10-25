type PasskeyErrorAlertProps = {
	message: string | null;
};

export function PasskeyErrorAlert({
	message,
}: Readonly<PasskeyErrorAlertProps>) {
	if (!message) return null;

	return (
		<p role="alert" className="text-sm text-red-700 dark:text-red-300">
			{message}
		</p>
	);
}
