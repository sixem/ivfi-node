import { formatDate } from '../vendors/date/date';

export const gmdate = (format: string, timestamp: any) =>
{
	const dt = typeof timestamp === 'undefined'
		? new Date()
		: (timestamp instanceof Date
			? new Date(timestamp)
			: new Date(timestamp * 1000)
		);

	timestamp = Date.parse(dt.toUTCString().slice(0, -4)) / 1000;

	return formatDate(format, timestamp);
};