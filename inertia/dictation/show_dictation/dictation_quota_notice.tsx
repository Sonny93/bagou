import { formatRemainingQuota } from './format_remaining_quota';

type DictationQuotaNoticeProps = {
	remainingMinutes: number;
};

export const DictationQuotaNotice = ({
	remainingMinutes,
}: Readonly<DictationQuotaNoticeProps>) => (
	<p className="text-xs text-gray-500 dark:text-gray-400">
		{formatRemainingQuota(remainingMinutes)}
	</p>
);
