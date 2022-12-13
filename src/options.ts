/** Vendors */
import _ from 'lodash';

/** Types */
import {
	TOptions
} from './core/types/';

/**
 * This script contains the default options for IVFi to use
 * 
 * It also exports the functions set, insert and get, which are used to interact with the options
 */

 type TOptionsInteractor = {
	set: (object: {
		[key: string]: any
	}) => object;
	insert: (path: string, values: any) => object;
	get: (path?: string, fallback?: any) => any;
};

const data: TOptions = {
	processor: null,
	format: {
		sizes: [' B', ' KiB', ' MiB', ' GiB', ' TiB'],
		date: ['d/m/y H:i', 'd/m/y']
	},
	sorting:
	{
		enabled: false,
		types: 0,
		sortBy: 'name',
		ascending: 1
	},
	gallery :
	{
		enabled: true,
		reverseOptions: false,
		scrollInterval: 50,
		listAlignment: 0,
		fitContent: true
	},
	preview:
	{
		enabled: true,
		hoverDelay: 75,
		cursorIndicator: true
	},
	readme: {
		enabled: true,
		hidden: false,
		toggled: true
	},
	media: {
		extensions: {
			image: ['jpg', 'jpeg', 'png', 'gif', 'ico', 'svg', 'bmp', 'webp'],
			video: ['webm', 'mp4', 'ogv', 'ogg', 'mov']
		},
	},
	style: {
		themes: false,
		compact: false
	},
	icon: {
		path: null,
		mime: 'image/png'
	},
	performance: 100,
	exclude: false,
	debug: false,
};

const options: TOptionsInteractor = {
	set: (object) =>
	{
		return _.mergeWith(data, object, (a, b) => 
			_.isArray(b) ? b : undefined
		);
	},
	insert: (path, value) =>
	{
		return _.set(data, path, value);
	},
	get: (path = null, fallback = null) =>
	{
		return _.get(data, path, !fallback ? data : fallback);
	}
};

export { options, TOptions, TOptionsInteractor };