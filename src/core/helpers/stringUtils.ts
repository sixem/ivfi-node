import {
	TExtensionArray
} from '../types';

/**
 * Capitalizes an input
 */
export const capitalize = (input: string): string =>
{
	return input.charAt(0).toUpperCase() + input.slice(1);
};

/**
 * Shortens a string
 */
export const shortenString = (input: string, cutoff: number): string =>
{
	cutoff = cutoff || 28;

	if(input.length > cutoff)
	{
		return [
			input.substring(0, Math.floor((cutoff / 2) - 2)),
			input.substring(input.length - (Math.floor((cutoff / 2) - 2)), input.length)
		].join(' .. ');
	} else {
		return input;
	}
};

/**
* Identifies extension
*/
export const identifyExtension = (
	url: string,
	extensions: TExtensionArray = {
		image: [],
		video: []
	}
): Array<string | number> | null =>
{
	const extension = (url).split('.').pop().toLowerCase();

	if(extensions.image.includes(extension))
	{
		return [extension, 0];

	} else if(extensions.video.includes(extension))
	{
		return [extension, 1];
	}

	return null;
};

/**
 * Strips `?` and anything that follows from a URL
 */
export const stripUrl = (url: string): string =>
{
	return !url.includes('?') ? url: url.split('?')[0];
};

/**
 * Trimming functions
 */
export const trimLeft = (s: string, char: string): string =>
{
	return s.startsWith(char) ? s.substr(1) : s;
};

export const trimRight = (s: string, char: string): string =>
{
	return s.endsWith(char) ? s.slice(0, -1) : s;
};

export const trimBoth = (s: string, char: string): string =>
{
	return trimRight(trimLeft(s, char), char);
};

/**
 * Strips the extension from a string
 */
export const stripExtension = (string: string): string =>
{
	return string.replace(/\.[^/.]+$/, '');
};

/**
 * Adds a trailing character to a string IF it does not already exist
 */
export const addTrailing = (s: string, char: string) =>
{
	return s.endsWith(char) ? s: (s + char);
};
 
/**
 * Adds a leading character to a string IF it does not already exist
 */
export const addLeading = (s: string, char: string) =>
{
	return s.startsWith(char) ? s: (char + s);
};