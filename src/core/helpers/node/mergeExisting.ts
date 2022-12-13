import _ from 'lodash';

/**
 * Merges an object without adding non-existant keys to the destination object
 */
export const mergeExisting = {
	keepShapeArray: (
		destination: any[],
		source: any[]
	) =>
	{
		if(source.length != destination.length)
		{
			return destination;
		}

		const r = [];

		destination.forEach((v, i) =>
		{
			r[i] = mergeExisting.keepShape(v, source[i]);
		});

		return r;
	},
	keepShapeObject: (
		destination: {
			[key: string]: any;
		},
		source: {
			[key: string]: any;
		}
	) =>
	{

		const r = {};

		Object.keys(destination).forEach((key) =>
		{
			const sourceValue = source[key];

			if(typeof sourceValue !== 'undefined')
			{
				r[key] = mergeExisting.keepShape(destination[key], sourceValue);
			}
			else {
				r[key] = destination[key];
			}
		});

		return r;
	},
	keepShape: (
		destination: {
			[key: string]: any;
		},
		source: {
			[key: string]: any;
		}
	) =>
	{
		if(_.isArray(destination))
		{
			if(!_.isArray(source))
			{
				return destination;
			}

			return mergeExisting.keepShapeArray(destination, source);
		} else if(_.isObject(destination))
		{
			if(!_.isObject(source))
			{
				return destination;
			}

			return mergeExisting.keepShapeObject(destination, source);
		} else
		{
			return source;
		}
	}
};