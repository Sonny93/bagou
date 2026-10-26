type PasskeyErrorAlertProps = {
	message: string | null;
};

export function PasskeyErrorAlert({
	message,
}: Readonly<PasskeyErrorAlertProps>) {
	if (!message) return null;

	return (
		<p role="alert" className="flex items-start gap-2 text-sm text-signal">
			<span
				className="i-tabler-alert-circle mt-0.5 size-4 shrink-0"
				aria-hidden
			/>
			{message}
		</p>
	);
}
