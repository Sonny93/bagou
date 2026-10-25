import { cn } from '~/shared/lib/cn';

const LEVEL_GAIN = 4;

type LevelMeterProps = {
	level: number;
	className?: string;
};

export const LevelMeter = ({ level, className }: Readonly<LevelMeterProps>) => (
	<div
		role="presentation"
		className={cn(
			'h-2 w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600',
			className
		)}
	>
		<div
			className="h-full origin-left rounded-full bg-red-500 transition-transform duration-100"
			style={{ transform: `scaleX(${Math.min(1, level * LEVEL_GAIN)})` }}
		/>
	</div>
);
