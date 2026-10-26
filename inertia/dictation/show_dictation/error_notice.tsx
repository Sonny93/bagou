type ErrorNoticeProps = {
	message: string;
};

export const ErrorNotice = ({ message }: Readonly<ErrorNoticeProps>) => (
	<p role="alert" className="flex items-start gap-3 text-base">
		<span
			className="i-tabler-alert-circle mt-0.5 size-5 shrink-0 text-signal"
			aria-hidden
		/>
		{message}
	</p>
);
