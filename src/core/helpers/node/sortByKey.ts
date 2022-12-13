import _ from 'lodash';

import {
	isNumeric
} from '../index';

/**
 * Sorts an object by a key
 */
export const sortByKey = (
	obj: {
		[key: string]: string | number;
	} | any,
	path: string,
	order = 'asc'
) =>
{
	const ascending = (order === 'asc');

	return obj.sort((a: string | number, b: string | number) =>
	{
		const value = {
			a: _.get(a, path),
			b: _.get(b, path)
		};

		return isNumeric(value.a) && isNumeric(value.b)
			? (ascending)
				? (value.a - value.b)
				: (value.b - value.a)
			: (ascending)
				? (value.a).localeCompare(value.b)
				: (value.b).localeCompare(value.a);
	});
};