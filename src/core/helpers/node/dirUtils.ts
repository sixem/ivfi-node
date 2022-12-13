import path from 'path';

import { promises as fsp } from 'fs';
import { options } from '../../../options';

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
		files: any[];
		directories: any[];
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

const dirScan = async (path: string, opts: TOptions = {}): Promise<TFile[]> =>
{
	/* Filter out hidden files (.), invalid filenames (#) and (some) windows specific directories ($) */
	const files = (await fsp.readdir(path)).filter((file) =>
	{
		if((['.', '$'].includes(file[0]) || file.includes('#'))
			&& file !== '.indexignore')
		{
			return false;
		} else {
			return true;
		}
	});

	/* Map to include extensions etc */
	let mappedFiles = files.map((file) =>
	{
		return {
			basename: file,
			extension: file.split('.').pop().toLowerCase()
		};
	});

	/* Filter extensions if include is set */
	if(opts.include
		&& Array.isArray(opts.include)
		&& opts.include.length > 0)
	{
		mappedFiles = mappedFiles.filter((file: TFile) =>
		{
			return (opts.include).includes(file.extension);
		});
	}

	return mappedFiles;
};

/**
 * Collects the files (directory structure) from a directory
 */
const dirCollect = async (
	pathInfo: {
		[key: string]: any;
	},
	opts: {
		[key: string]: any;
	} = {}
): Promise<TCollected> =>
{
	const data = {
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

	await asyncForEach(await dirScan(pathInfo.real), async(file: TFile) =>
	{
		try
		{
			const stats = await fsp.stat(path.join(pathInfo.real, file.basename));

			files.push({
				basename: file.basename,
				extension: file.extension,
				directory: !stats.isFile() ? true : false,
				stats: stats
			});
		} catch(error)
		{
			console.error(error);
		}
	});

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
		client: opts.timezone.offset
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
			size,
			modified: {
				raw: modified,
				formatted
			}
		});
	});

	return data;
};

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