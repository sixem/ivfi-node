'use strict';

const f = require('./functions.js');

const express = require('express');
const cookies = require('cookie-parser');
const compression = require('compression');

const path = require('path');
const fsp = require('fs').promises;

const app = express();

var development = (process.env.NODE_ENV === 'development' ? true : false), config = {
	client : {}, app : f.config.get()
};

/* Handles any incoming requests. */
const handle = async (directory, req, res, executed = null) =>
{
	try
	{
		var relative = decodeURIComponent(req.path),
		requested = await fsp.realpath(path.join(directory, relative)),
		stat = await fsp.lstat(requested),
		validated = f.isAbovePath(f.trim.right(directory, '/'), path.resolve(requested.replace(/\\/g, '/')));

		if(!validated)
		{
			throw new Error(`Directory request could not be validated.`);
		}

		if(validated && stat.isDirectory())
		{
			/* Request is a directory, collect data and render. */

			/* Read client cookie, returns {} when unexisting. */
			var client = f.cookie.read(req);

			/* Create a temporary user config for the client. */
			var user = f.setUserConfig(
				f.obj.clone(config.client),
				client
			);

			/* Create a UTC timestamp for the client sided scripts to work with. */
			user.timestamp = f.calculateOffset(0);

			/* Collect directory data. */
			var data = await f.dir.collect({
				real : requested,
				relative : relative
			}, {
				timezone : {
					offset : client.timezone_offset ? (client.timezone_offset * 60) : 0
				}
			});

			/* Collected data has some value stored in a 'raw' key that we need to access. */
			var raw = ['size', 'modified'].includes(user.sorting.sort_by) ? true : false;

			/* Apply file sorting. */
			if(user.sorting.types === 0 || user.sorting.types === 1)
			{
				f.sortByKey(
					data.contents.files,
					`${user.sorting.sort_by}${raw ? '.raw' : ''}`,
					user.sorting.order
				);
			}

			/* Apply directory sorting. */
			if(user.sorting.types === 0 || user.sorting.types === 2)
			{
				f.sortByKey(
					data.contents.directories,
					`${user.sorting.sort_by}${raw ? '.raw' : ''}`,
					user.sorting.order
				);
			}

			/* Trim the relative path (request uri). */
			relative = relative !== '/' ? f.trim.right(relative, '/') : relative;

			/* Render the page. Variables are passed to views/index.pug. */
			res.render('index', {
				config : user,
				contents : data.contents,
				path : f.clickablePath(relative),
				req : relative,
				parent : f.addLeading(path.dirname(relative).split(path.sep).pop(), '/'),
				count : {
					files : data.contents.files.length,
					directories : data.contents.directories.length
				},
				stats : {
					total : {
						size : f.getReadableSize(data.stats.total.size)
					},
					newest : data.stats.newest
				},
				rendered : f.getExecutionTime(process.hrtime(executed))
			});
		} else if(validated && stat.isFile())
		{
			/* Request is a file, display it. */
			var exclude = f.config.get('exclude'), sent = false;

			if(Array.isArray(exclude))
			{
				if(exclude.includes(requested.split('.').pop().toLowerCase()))
				{
					res.status(404).render('errors/404');
					sent = true;
				}
			}

			if(!sent)
			{
				res.sendFile(requested);
			}
		}
	} catch(e)
	{
		if(e.code === 'ENOENT')
		{
			/* Path does not exist on the server side. */
			res.status(404).render('errors/404');
		} else {
			/* Any non-ENOENT (404) error. */
			console.error(e);

			res.status(400).render('errors/400');
		}
	}
};

module.exports = (working_directory) =>
{
	/* Set view engine and path. */
	app
	.set('view engine', 'pug')
	.set('views', path.join(working_directory, 'views'));

	/* Enable cookie reader and gzip compression. */
	app
	.use(cookies())
	.use(compression());

	var module = {
		server : null,
		directory : null,
		port : null,
		get : () =>
		{
			return module.server;
		},
		switch : (directory) =>
		{
			return module.directory = directory.replace(/\\/g, '/');
		},
		start : async (callback = () => {}) =>
		{
			return await module.server.listen(module.port, callback(module.server));
		},
		stop : async () =>
		{
			return await module.server.close();
		},
		run : async (port = 80, directory = working_directory, options = {}) =>
		{
			/* Store/set port and directory. */
			module.port = port;
			module.directory = directory.replace(/\\/g, '/');

			/* Merge set config with defaults. */
			f.config.set(options)

			/* If in production, check for dist directory. */
			if(!development)
			{
				try
				{
					await fsp.realpath(path.join(working_directory, 'dist'));
					await fsp.realpath(path.join(working_directory, 'lib'));
				} catch(e)
				{
					if(e.code === 'ENOENT')
					{
						console.info('Compiled directories were not found. Try running "npm run compile" to compile the required files.');
					} else {
						console.error(e);
					}

					process.exit(0);
				}
			}

			/* Set public directory. */
			app.use(express.static(working_directory + `/${development ? 'public' : 'dist'}/`));

			/* Set what static directories should be used for which extensions. */
			var serve = {
				css : ['.css'],
				js : ['.js'],
				fonts : ['.woff2']
			};

			/* Loop over static directories and apply them. */
			Object.keys(serve).forEach((key) =>
			{
				app.use(`*/${key}/`, express.static(`${working_directory}/${development ? 'public' : 'dist'}/${key}`, {
					extensions : serve[key]
				}));
			});

			/* Set authentication. */
			if(f.obj.has(options, 'authentication.users'))
			{
				app.use(require('express-basic-auth')(
				{
					users : options.authentication.users,
					challenge : true
				}));
			}

			/* Load themes. */
			if(f.obj.has(options, 'style.themes'))
			{
				var pool = [], location = options.style.themes;

				try
				{
					pool = (await f.dir.scan(location, {
						include : ['css']
					})).map((e) => path.basename(e.basename, '.css'));
				} catch(e)
				{
					console.error(e);
				}

				if(pool.length > 0)
				{
					pool.unshift('default');

					f.config.insert('style.themes', {
						'path' : '/themes/',
						'pool' : pool,
						'set' : null
					});

					app.use('*/themes/', express.static(location, {
						extensions : ['css']
					}));
				} else {
					f.config.insert('style.themes', false);
				}
			}

			/* Handle any incoming requests. */
			app.get('(/*)?', (req, res) =>
			{
				handle(module.directory, req, res, process.hrtime());
			});

			/* Set http or https (if options.ssl isset) server. */
			module.server = (f.obj.has(options, 'ssl') ? 
				require('https').createServer(options.ssl, app) : 
				app
			);

			/* Create client config template. */
			config.client = f.createClientConfig(
				config.client,
				config.app,
				f.config.get()
			);

			/* Bind to port, listen. */
			module.server = await module.server.listen(module.port, async () =>
			{
				console.info(`Listening on :${module.port} ..`);
			});

			return module;
		}
	}

	return module;
};