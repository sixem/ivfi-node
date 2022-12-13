import _ from 'lodash';

import {
	Request
} from 'express';

import { CookieKey } from '../../constant/';

/**
 * Asynchronous forEach() function
 */
export const asyncForEach = async (array: any[], callback: any) =>
{
	for(let index = 0; index < array.length; index++)
	{
		await callback(array[index], index, array);
	}
};

/**
 * Calculates render time (process.hrtime())
 */
export const getExecutionTime = (t) =>
{
	return (t[0] + (t[1] / 1e9)).toFixed(6);
};

/**
 * Converts a wildcard string into a regular expression
 */
export const wildcardExpression = (wildcard) =>
{
	/** Escape input and create new regex expression */
	const escaped = wildcard.replace(/[.+^${}()|[\]\\]/g, '\\$&');

	return new RegExp(`^${escaped.replace(/\*/g,'.*')}$`);
};

/**
 * Checks if a path is above another path
 */
export const isAbovePath = (base, path) =>
{
	const b = path.startsWith(base);

	return b ? b: (base === path ? true: false);
};

export const cookieRead = (req: Request) =>
{
	if(_.isEmpty(req.cookies) || !req.cookies[CookieKey])
	{
		return {};
	} else {
		try
		{
			return JSON.parse(req.cookies[CookieKey]);
		} catch(e)
		{
			return {};
		}
	}
};