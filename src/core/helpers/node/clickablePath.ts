import _ from 'lodash';

import {
	trimBoth
} from '../index';

/**
 * Creates a clickable path (using anchors) from a path string
 */
export const clickablePath = (p) =>
{
	const parts = trimBoth(p, '/').split('/');
	
	let built = '<a href="/">/</a>';

	parts.forEach((part, index) =>
	{
		if(!_.isEmpty(part))
		{
			built = (built + `<a href="/${parts.slice(0, index + 1).join('/')}">${((index + 1) !== 1 ? '/': '')}${part}</a>`);
		}
	});

	return built;
};