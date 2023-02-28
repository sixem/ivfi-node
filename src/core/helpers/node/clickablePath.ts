import {
	trimBoth
} from '../index';

/**
 * Creates a clickable path (using anchors) from a path string
 */
export const clickablePath = (p: string) =>
{
	const parts = trimBoth(p, '/').split('/');
	
	let built = '<a href="/">/</a>';

	parts.forEach((part, index) =>
	{
		if(part.length > 0)
		{
			/** Create anchor href */
			const href = parts.slice(0, index + 1).join('/') + '/';

			built = (built + `<a href="/${href}">${((index + 1) !== 1 ? '/': '')}${
				/** Adds a trailing slash to the last index */
				part + (index === (parts.length - 1) ? '/' : '')
			}</a>`);
		}
	});

	return built;
};