/** Vendors */
import _ from 'lodash';
import express from 'express';
import cookies from 'cookie-parser';
import compression from 'compression';
import showdown from 'showdown';
import path from 'path';
import fs from 'fs';
import mime from 'mime-types';
import basicAuth from 'express-basic-auth';
import https from 'https';
import chalk from 'chalk';

/** Vendors */
import { promises as fsp } from 'fs';
import { Request, Response, NextFunction } from 'express';

/** Modules */
import { options } from './options';

/** Types */
import {
	TPageConfig,
	TOptions,
	TMetaData
} from './core/types/';

/** Helpers */
import {
	getReadableSize,
	calculateOffset,
	trimRight,
	addLeading
} from './core/helpers/';

/** Helpers */
import {
	dirCollect,
	isAbovePath,
	handleDotFile,
	configAdjust,
	configCreate,
	clickablePath,
	getExecutionTime,
	sortByKey,
	loadThemes,
	cookieRead,
	debug,
	logger,
	mergeMetadata
} from './core/helpers/node/';

/** Markdown converter */
const converter = new showdown.Converter();

/** Express server */
const app = express();

/** Config storage */
const config: {
	clientTemplate: TPageConfig;
	server: TOptions;
} = {
	clientTemplate: {},
	server: options.get()
};

/** Handles any incoming requests */
const handle = async (
	directory: string,
	req: Request,
	res: Response,
	next: NextFunction,
	executed: any = null
) =>
{
	try
	{
		/** Get requested path */
		let relative = decodeURIComponent(req.path);

		/** Get absolute request, file stat and verify path validity */
		const requested = await fsp.realpath(path.join(directory, relative));
		const stat = await fsp.lstat(requested);
		const validated = isAbovePath(trimRight(directory, '/'), requested.replace(/\\/g, '/'));

		if(!validated)
		{
			throw new Error(chalk.red('Directory request could not be validated.'));
		}

		/** Request is a directory, collect data and render */
		if(validated && stat.isDirectory())
		{
			/** Redirect to trailing slash */
			if(req.path[req.path.length - 1] !== '/')
			{
				res.redirect(301, req.url + '/');
				return;
			}
			
			debug(chalk.yellow(`Navigating: ${chalk.green(`'${relative}'`)} ...`));

			/** Overridable variables passed to the renderer */
			let readmeContent: null | string = null,
				metadata: TMetaData = [
				{ charset: 'utf-8' },
				{ name: 'viewport', content: 'width=device-width, initial-scale=1' }
			];

			/** Merge any passed metadata with the default metadata */
			if(Array.isArray(config.server.metadata))
			{
				metadata = mergeMetadata(metadata, config.server.metadata);
			}

			/** Read client cookie, returns {} when unexisting */
			const client = cookieRead(req);

			/** Create a temporary user config for the client */
			const clientConfig = configAdjust(config.clientTemplate, client);

			/** Create a UTC timestamp for the client sided scripts to work with */
			clientConfig.timestamp = calculateOffset(0);

			/** Collect directory data */
			const data = await dirCollect({
				real: requested,
				relative: relative
			}, {
				timezone: {
					offset: client.timezoneOffset ? (client.timezoneOffset * 60) : 0
				}
			});

			/** Deconstruct contents */
			const { contents } = data;

			/** Set performance mode */
			clientConfig.performance = (clientConfig.performance !== false
					&& clientConfig.performance !== 0
					&& clientConfig.performance !== null)
				? (contents.files.length >= clientConfig.performance)
				: false;

			/** Handle any potential `README.md` files */
			if(config.server.readme.enabled)
			{
				/** Check for a `README.md` file */
				const readmeFile = contents.files.find((file) => file.name === 'README.md');

				if(readmeFile)
				{
					/** Read `README.md` file */
					const fileBuffer = await fsp.readFile(path.join(directory, readmeFile.relative), 'utf8');
					readmeContent = converter.makeHtml(fileBuffer.toString());

					/** Set hidden state if enabled */
					readmeFile.hidden = config.server.readme.hidden ? true: false;
				}
			}

			/** Check for dotfile (`.ivfi` file) */
			const dotFile = contents.files.find((file) => file.name === '.ivfi');

			if(dotFile)
			{
				dotFile.hidden = true;
				const fileBuffer = await fsp.readFile(path.join(directory, dotFile.relative), 'utf8');

				try {
					/** Attempt to parse and handle dotfile */
					handleDotFile(JSON.parse(fileBuffer.toString()), {
						directories: contents.directories,
						files: contents.files,
						metadata: metadata,
						setMetadata: (data: TMetaData) => metadata = data
					});
				} catch(e) {
					debug(chalk.red(`Error reading '.ivfi' file: ${e.message} - ignoring file.`));
				}
			}

			/** Collected data has some value stored in a `raw` key that we need to access */
			const raw = ['size', 'modified'].includes(clientConfig.sorting.sortBy) ? true: false;

			/** Apply file sorting */
			if(clientConfig.sorting.types === 0 || clientConfig.sorting.types === 1)
			{
				sortByKey(
					contents.files,
					`${clientConfig.sorting.sortBy}${raw ? '.raw' : ''}`,
					clientConfig.sorting.order
				);
			}

			/** Apply directory sorting */
			if(clientConfig.sorting.types === 0 || clientConfig.sorting.types === 2)
			{
				sortByKey(
					contents.directories,
					`${clientConfig.sorting.sortBy}${raw ? '.raw' : ''}`,
					clientConfig.sorting.order
				);
			}

			/** Trim the relative path (request URI) */
			relative = (relative !== '/' ? trimRight(relative, '/').replace(/([^:]\/)\/+/g, '$1'): relative);

			/** Set variables for passing to template */
			const variables = {
				config: clientConfig,
				contents: contents,
				path: clickablePath(relative),
				readme: {
					content: readmeContent,
					toggled: !clientConfig.readme.toggled
				},
				req: relative,
				parent: addLeading(relative.substring(0, relative.lastIndexOf('/')), '/'),
				count: {
					files: contents.files.length,
					directories: contents.directories.length
				},
				stats: {
					total: {
						size: getReadableSize(options.get('format.sizes'), data.stats.total.size)
					},
					newest: data.stats.newest
				},
				metadata: metadata,
				rendered: getExecutionTime(process.hrtime(executed))
			};

			/** If a processor function has been passed, pass the object to that and get response */
			const processor: any = options.get('processor');

			/** Render the page. Variables are passed to views/index.pug */
			res.render('index', processor ? processor(variables) : variables);
		} else if(validated && stat.isFile())
		{
			const exclude: Array<string> = options.get('exclude');

			let sent = false;

			if(Array.isArray(exclude))
			{
				if(exclude.includes(requested.split('.').pop().toLowerCase()))
				{
					/** Extension is excluded, show an error */
					res.status(404).render('errors/404');
					sent = true;
				}
			}

			if(!sent)
			{
				debug(chalk.yellow(`Serving: ${chalk.cyan(`'${relative}'`)} ...`));

				/** Request is a valid file, attempt to display it */
				res.sendFile(requested, (error) =>
				{
					if(error)
					{
						debug(chalk.red(`Encountered an error when serving file ${chalk.cyan(`'${requested}'`)}: ${error}`));
						res.status(404).render('errors/404');
						next();
					}
				});
			}
		} else {
			res.status(400).render('errors/400');
		}
	} catch(e)
	{
		logger('error', chalk.red('error'), e);

		if(e.code === 'ENOENT')
		{
			/** Path does not exist on the server side */
			res.status(404).render('errors/404');

		} else {
			/** Any non-ENOENT (404) error */
			res.status(400).render('errors/400', {
				code: e.code
			});
		}

		next();
	}
};

const ivfi = (workingDirectory: string = path.join(__dirname, '..')) =>
{
	/** Set view engine and path */
	app
		.set('view engine', 'pug')
		.set('views', path.join(workingDirectory, 'views'));

	/** Enable cookie reader and gzip compression */
	app
		.use(cookies())
		.use(compression());

	const module = {
		/**
		 * Module variables
		 */
		server: null,
		directory: null,
		port: null,
		/**
		 * Server instance getter
		 */
		get: () =>
		{
			return module.server;
		},
		/**
		 * Changes the directory of the server
		 */
		switch: (directory: string) =>
		{
			const setDir = directory.replace(/\\/g, '/');
			logger('info', chalk.yellow(`Switching root directory to: ${chalk.green(`'${setDir}'`)}`));
			return module.directory = setDir;
		},
		/**
		 * Starts the server
		 */
		start: async (callback: any = () => {}) =>
		{
			logger('info', chalk.green('Starting server ...'));
			return await module.server.listen(module.port, callback(module.server));
		},
		/**
		 * Stops the server
		 */
		stop: async () =>
		{
			logger('info', chalk.red('Stopping server ...'));
			return await module.server.close();
		},
		/**
		 * Initiates and starts the server
		 */
		run: async (
			port = 80 /** Port to expose the web server on */,
			directory = workingDirectory /** Root working directory */,
			_options: TOptions = {}) =>
		{
			/** Store/set port and directory */
			module.port = port;
			module.directory = path.resolve(directory).replace(/\\/g, '/');

			/** Merge set config with defaults */
			options.set(_options);

			/** Print some debugging information */
			debug(chalk.yellow('Debugging is enabled.'));
			debug(chalk.yellow(`Using options: ${chalk.gray(JSON.stringify(_options))}`));
			debug(chalk.yellow(`Root directory is set to: ${chalk.green(`'${directory}'`)}`));

			try
			{
				/** Checks if /dist/ exists */
				await fsp.realpath(path.join(workingDirectory, 'dist'));
			} catch(e)
			{
				if(e.code === 'ENOENT')
				{
					/** /dist/ does not exist */
					logger('info', chalk.yellow('Compiled directories were not found. Try running "npm run compile" to build the required files.'));
				} else {
					logger('error', chalk.red(e));
				}

				process.exit(0);
			}

			/** Set authentication */
			if(_.has(_options, 'authentication.users') && _options.authentication.users)
			{
				if(_.has(_options, 'authentication.restrict') && _options.authentication.restrict)
				{
					const restrict = Array.isArray(_options.authentication.restrict)
						? _options.authentication.restrict
						: [_options.authentication.restrict].filter((route) => _.isString(route));

						debug(chalk.yellow('Applying authentication to restricted routes:'), chalk.gray(restrict.join(', ')));

					/** Apply authentication to restricted routes */
					for(const route of restrict)
					{
						app.get(route, basicAuth({
							users: _options.authentication.users,
							challenge: true
						}));
					}
				} else {
					debug(chalk.yellow('Applying global authentication.'));

					/** Apply global authentication */
					app.use(basicAuth({
						users: _options.authentication.users,
						challenge: true
					}));
				}
			}

			/** Set public directory */
			app.use(express.static(`${workingDirectory}/dist/`));

			/** Load themes */
			if(_.has(_options, 'style.themes.path') && _.isObject(_options.style.themes))
			{
				const location: string = _options.style.themes.path;

				/** Get available themes */
				const pool = await loadThemes(_options.style.themes.path);

				if(pool)
				{
					debug(chalk.yellow(`Loaded ${Object.keys(pool).length} theme(s)`));

					options.insert('style.themes', {
						path: '/themes/',
						pool: pool,
						/** Get default theme if set, also check if it exists in pool */
						set: _.has(_options, 'style.themes.default')
							? (pool[_options.style.themes.default.toLowerCase()]
								? _options.style.themes.default.toLowerCase()
								: null)
							: null
					});

					/** Serve themes files through /themes/ */
					app.use('/themes/', express.static(location));
				} else {
					/** No themes were found, disable themes */
					options.insert('style.themes', false);
				}
			}

			/** Set metadata */
			if(_.has(_options, 'metadata') && Array.isArray(config.server.metadata))
			{
				config.server.metadata = _options.metadata.filter((item) => _.isObject(item));
			} else {
				config.server.metadata = null;
			}

			let customIconURI = null;

			/** Handle custom favicon */
			if(_.has(_options, 'icon.file') && _.isString(_options.icon.file))
			{
				const iconPath = path.resolve(_options.icon.file);

				if(fs.existsSync(iconPath))
				{
					const iconName = path.basename(iconPath);
					const iconUri = `/favicon${path.extname(iconName)}`;

					debug(chalk.yellow(`Using custom favicon: ${chalk.green(`'${iconName}'`)}`));

					/** Set MIME type automatically, but don't force it if a custom one already has been set */
					if(!_.has(_options, 'icon.mime'))
					{
						config.server.icon.mime = mime.lookup(iconName) || 'image/png';
					}

					/** Set favicon path */
					config.server.icon.path = iconUri;

					customIconURI = iconUri;

					app.get(iconUri, (req: Request, res: Response, next: NextFunction) =>
					{
						res.sendFile(path.resolve(iconPath), (error) =>
						{
							if(error)
							{
								res.status(404).render('errors/404');
							}
						});
					});
				} else {
					logger('warning', chalk.red(`Custom favicon '${iconPath}' does not exist - continuing without.`));
				}
			}

			/** Handle any incoming requests */
			app.get('(/*)?', (req: Request, res: Response, next: NextFunction) =>
			{
				if(customIconURI && req.path === customIconURI)
				{
					return;
				}

				handle(module.directory, req, res, next, process.hrtime());
			});

			/** Set http or https (if options.ssl is set) server */
			module.server = (_.has(_options, 'ssl') && _.isObject(_options.ssl) ? https.createServer(_options.ssl, app) : app);

			/** Create client config template */
			config.clientTemplate = configCreate(config.server, options.get());

			/** Bind to port and listen for requests */
			module.server = await module.server.listen(module.port, async () =>
			{
				const listenUrl = `http${_.has(_options, 'ssl') ? 's' : ''}://localhost:${module.port}`;
				logger('info', `Listening on ${chalk.green(listenUrl)} ...`);
			});

			return module;
		}
	};

	return module;
};

export default ivfi;