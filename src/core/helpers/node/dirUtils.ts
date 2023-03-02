import path from 'path';

import { promises as fsp } from 'fs';
import { options } from '../../../options';

import {
	TFileContent
} from '../../types';

import {
	getReadableSize,
	calculateOffset,
	gmdate
} from '../index';

import {
	asyncForEach
} from './index';

type TOptions = {
	include?: string[]
};

type TFile = {
	basename: string;
	extension: string;
	directory?: boolean;
};

type TCollected = {
	contents: {
		files: Array<TFileContent>;
		directories: Array<TFileContent>;
	};
	stats: {
		total: {
			size: number;
		};
		newest: {
			file: number;
			directory: number;
		};
	};
};

const dirScan = async (path: string, _options: TOptions = {}): Promise<TFile[]> =>
{
	let files = [];

	(await fsp.readdir(path, {
		withFileTypes: true
	})).forEach((dirEnt =>
	{
		if(!((['.', '$'].includes(dirEnt.name[0]) || dirEnt.name.includes('#'))
			&& dirEnt.name !== '.ivfi'))
		{
			files.push({
				basename: dirEnt.name,
				extension: dirEnt.name.split('.').pop().toLowerCase()
			});
		}
	}));

	/* Filter extensions if include is set */
	if(_options.include
		&& Array.isArray(_options.include)
		&& _options.include.length > 0)
	{
		files = files.filter((file: TFile) =>
		{
			return (_options.include).includes(file.extension);
		});
	}

	return files;
};

/**
 * Collects the files (directory structure) from a directory
 */
const dirCollect = async (
	pathInfo: {
		[key: string]: any;
	},
	_options: {
		[key: string]: any;
	} = {}
): Promise<TCollected> =>
{
	const data: TCollected = {
		contents: {
			files: [],
			directories: []
		},
		stats: {
			total: {
				size: 0
			},
			newest: {
				file: 0,
				directory: 0
			}
		}
	};

	let files = [];
	
	const extensions = options.get().media.extensions;
	const exclude = options.get('exclude');

	/* Scan directory and get file information */
	await Promise.all((await dirScan(pathInfo.real)).map(async (file: TFile) =>
	{
		try
		{
			const stats = await fsp.stat(path.join(pathInfo.real, file.basename));

			files.push({
				basename: file.basename,
				extension: file.extension.toLowerCase(),
				directory: !stats.isFile() ? true : false,
				stats: stats
			});
		} catch(error)
		{
			console.error(error);
		}
	}));

	const filter = options.get('filter');

	filter.exclude = exclude;

	/* Filter files if a filter is set */
	if(filter.exclude
		|| filter.file
		|| filter.directory)
	{
		files = dirFilter(files, filter);
	}

	const offset = {
		client: _options.timezone.offset
	};

	const format = options.get('format');

	/* Iterate over found files */
	await asyncForEach(files, async (file) =>
	{
		const type = extensions.image.includes(file.extension)
			? 0
			: (extensions.video.includes(file.extension)
				? 1
				: null
			);

		const modified = Math.round(file.stats.mtimeMs / 1000);
		const key = (file.directory ? 'directory': 'file');

		if(modified > data.stats.newest[key])
		{
			data.stats.newest[key] = modified;
		}

		const size: {
			readable?: string;
			raw: number;
		} = {
			raw: (file.directory ? 0: file.stats.size)
		};

		size.readable = getReadableSize(format.sizes, size.raw);
		data.stats.total.size = (data.stats.total.size + size.raw);

		const adjusted = calculateOffset(offset.client, modified);

		const formatted: string[] = Array.isArray(options.get().format.date)
			? [0, 1].map((i) => gmdate(options.get().format.date[i], adjusted))
			: Array(2).fill(gmdate(options.get().format.date, adjusted));

		data.contents[file.directory ? 'directories': 'files'].push({
			media: (type === 0 || type === 1) ? true : false,
			type: type === 0 ? 'image': (type === 1 ? 'video': 'other'),
			hidden: false,
			relative: path.join(pathInfo.relative, (file.basename)).replace(/\\/g, '/'),
			name: file.basename,
			extension: (!file.directory ? file.extension : null) || null,
			size: size,
			modified: {
				raw: modified,
				formatted
			}
		});
	});

	return data;
};

/**
 * Filters files based on a filter object
 */
const dirFilter = (
	files: TFile[],
	filter: {
		exclude?: string;
		directory?: string;
		file?: string;
}) =>
{
	return files.filter((file) =>
	{
		if(filter.exclude)
		{
			if((filter.exclude).includes(file.extension))
			{
				return false;
			}
		}

		if(filter.directory && file.directory)
		{
			return (file.basename).match(new RegExp(filter.directory));
		} else if(filter.file && !file.directory)
		{
			return (file.basename).match(new RegExp(filter.file));
		}

		return true;
	});
}; 

export {
	dirScan,
	dirFilter,
	dirCollect,
	TFile,
	TCollected
};