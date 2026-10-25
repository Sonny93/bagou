import { cn } from '~/shared/lib/cn';

type DictationMessageProps = {
	text: string;
	isError?: boolean;
};

export const DictationMessage = ({
	text,
	isError = false,
}: Readonly<DictationMessageProps>) => (
	<p
		role={isError ? 'alert' : 'status'}
		className={cn(
			'text-lg text-gray-600 dark:text-gray-300',
			isError && 'text-red-700 dark:text-red-300'
		)}
	>
		{text}
	</p>
);
