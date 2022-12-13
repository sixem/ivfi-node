import path from 'path';
import chalk from 'chalk';

import { promises as fsp } from 'fs';

import {
	dirScan,
	asyncForEach,
	TFile,
	logger
} from './index';

import {
	stripExtension
} from '../index';

/**
 * Loads themes from a path into a pool (object containing paths and named keys)
 */
export const loadThemes = async (location: string) =>
{
	const pool: {
		[key: string]: {
			path: null | string;
		}
	} = {
		default: {
			path: null
		}
	};

	try
	{
		await asyncForEach(await dirScan(location), async (file: TFile) =>
		{
			const rootName = file.basename;
			const stat = await fsp.lstat(path.join(location, rootName));

			if(stat.isFile() && (file.extension).toLowerCase() === 'css')
			{
				/** Add a single stylesheet to the pool */
				pool[stripExtension(rootName).toLowerCase()] = {
					path: path.join('/themes/', rootName)
				};
			} else if(stat.isDirectory())
			{
				const themeDir = path.join(location, rootName);

				/** Child is a directory, scan it for stylesheets */
				(await dirScan(themeDir, {
					include: ['css']
				})).map((file) =>
				{
					const childName = file.basename;

					/** Directory is a theme directory, add stylesheet to pool */
					pool[stripExtension(childName).toLowerCase()] = {
						path: path.join('/themes/', rootName, childName)
					};
				});
			}
		});

		return Object.keys(pool).length === 1 ? null : pool;
	} catch(error)
	{
		logger('error', 'Loading themes failed', chalk.red(error));

		return null;
	}
};