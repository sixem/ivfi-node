/**
 * Calculates a timestamp with a offset
 */
export const calculateOffset = (offset: number, timestamp: number | any = null) =>
{
	return (
		timestamp
			? timestamp
			: (Math.floor((new Date() as any) / 1000))) + (offset > 0 ? -Math.abs(offset)
		: Math.abs(offset)
	);
};