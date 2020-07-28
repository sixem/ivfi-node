'use strict';

const config = require('./config.js');

const path = require('path');
const fsp = require('fs').promises;
const _ = require('lodash');

module.exports.dir = {
	/* Filter filenames using regex strings. */
	filter : (files, filter) =>
	{
		return files.filter((obj) =>
		{
			if(filter.exclude)
			{
				if((filter.exclude).includes(obj.extension))
				{
					return false;
				}
			}

			if(filter.directory && obj.directory)
			{
				return (obj.basename).match(new RegExp(filter.directory, !filter.sensitive ? 'i' : ''));
			} else if(filter.file && !obj.directory)
			{
				return (obj.basename).match(new RegExp(filter.file, !filter.sensitive ? 'i' : ''));
			}

			return true;
		});
	},
	/* Scans the selected path. */
	scan : async (_path, options = {}) =>
	{
		/* Read directory. */
		var files = await fsp.readdir(_path);

		/* Hide hidden files and (some) windows specific directories ($). */
		files = files.filter((file) => !['.', '$'].includes(file[0]));

		/* Map to include extensions etc. */
		files = files.map((file) =>
		{
			return {
				basename : file,
				extension : file.split('.').pop().toLowerCase()
			};
		});

		/* Filter extensions if include is set. */
		if(options.include && Array.isArray(options.include) && options.include.length > 0)
		{
			files = files.filter((file) =>
			{
				return (options.include).includes(file.extension);
			});
		}

		return files;
	},
	/* Collects fileinfo from a path using .scan ^. */
	collect : async (_path, options = {}) =>
	{
		var data = {
			contents : {
				files : [],
				directories : []
			},
			stats : {
				total : {
					size : 0
				},
				newest : {
					file : 0,
					directory : 0
				}
			}
		};

		var files = [], extensions = config.get().media.extensions, exclude = config.get('exclude');

		/* */
		await module.exports.asyncForEach(await module.exports.dir.scan(_path.real), async(file) =>
		{
			try
			{
				var location = path.join(_path.real, file.basename), stats = await fsp.stat(location);

				files.push({
					basename : file.basename,
					extension : file.extension,
					directory : !stats.isFile() ? true : false,
					stats : stats
				});
			} catch(e)
			{
				console.error(e);
			}
		});

		var filter = config.get('filter');

		filter.exclude = exclude;

		/* Filter files if a filter is set. */
		if(filter.exclude || filter.file || filter.directory)
		{
			files = module.exports.dir.filter(files, filter);
		}

		var offset = {
			client : options.timezone.offset
		};

		/* Iterate over found files. */
		await module.exports.asyncForEach(files, async (file) =>
		{
			var type = extensions.image.includes(file.extension) ? 
				0 : (extensions.video.includes(file.extension) ? 1 : null),
			modified = Math.round(file.stats.mtimeMs / 1000);

			var key = (file.directory ? 'directory' : 'file');

			if(modified > data.stats.newest[key])
			{
				data.stats.newest[key] = modified;
			}

			var size = {
				raw : (file.directory ? 0 : file.stats.size)
			};

			size.readable = module.exports.getReadableSize(size.raw);
			data.stats.total.size = (data.stats.total.size + size.raw);

			var formatted;

			if(Array.isArray(config.get().format.date))
			{
				var adjusted = module.exports.calculateOffset(offset.client, modified);

				formatted = [
					module.exports.dates.gmdate(config.get().format.date[0], adjusted),
					module.exports.dates.gmdate(config.get().format.date[1], adjusted)
				];
			} else {
				var f = module.exports.dates.gmdate(config.get().format.date, adjusted);
				formatted = [f, f];
			}

			data.contents[file.directory ? 'directories' : 'files'].push({
				media : (type === 0 || type === 1) ? true : false,
				type : type === 0 ? 'image' : (type === 1 ? 'video' : 'other'),
				relative : path.join(_path.relative, (file.basename)).replace(/\\/g, '/'),
				name : file.basename,
				size,
				modified : {
					raw : modified,
					formatted
				}
			});
		});

		return data;
	}
};

/* Creates a client config. 
 * This is a template that is later used to create a temporary user config. */
module.exports.createClientConfig = (client, app, overrides) =>
{
	var template = {
		format : (app).format,
		preview : (app).preview,
		sorting : (app).sorting,
		gallery : (app).gallery,
		extensions : (app).media.extensions,
		style :
		{
			themes : (app).style.themes,
			compact : (app).style.compact
		},
		debug : (app).debug
	};

	client = module.exports.mergeExisting.keepShapeObject(template, overrides);

	return client;
};

/* Merges an object without adding non-existant keys to the destination object. */
module.exports.mergeExisting = {
	keepShapeArray : (dest, source) =>
	{
		if(source.length != dest.length)
		{
			return dest;
		}

		let ret = [];

		dest.forEach((v, i) =>
		{
			ret[i] = module.exports.mergeExisting.keepShape(v, source[i]);
		});

		return ret;
	},
	keepShapeObject : (dest, source) =>
	{
		let ret = {};

		Object.keys(dest).forEach((key) =>
		{
			let source_value = source[key];

			if(typeof source_value !== 'undefined')
			{
				ret[key] = module.exports.mergeExisting.keepShape(dest[key], source_value);
			}
			else {
				ret[key] = dest[key];
			}
		});

		return ret;
	},
	keepShape : (dest, source) =>
	{
		if(_.isArray(dest))
		{
			if(!_.isArray(source))
			{
				return dest;
			}

			return module.exports.mergeExisting.keepShapeArray(dest, source);
		} else if(_.isObject(dest))
		{
			if(!_.isObject(source))
			{
				return dest;
			}

			return module.exports.mergeExisting.keepShapeObject(dest, source);
		} else
		{
			return source;
		}
	}
}

/* Sets required values (settings etc.) to a user config. */
module.exports.setUserConfig = (conf, client) =>
{
	if(_.isEmpty(client) || !client) return conf;

	if(_.has(client, 'style.compact') && typeof client.style.compact === 'boolean')
	{
		conf.style.compact = client.style.compact;
	}

	if(_.has(conf, 'style.themes') && _.isObject(conf.style.themes))
	{
		if(_.has(client, 'style.theme'))
		{
			conf.style.themes.set = (!client.style.theme ? false : client.style.theme);
		}
	}

	if(_.has(client, 'sort'))
	{
		if(client.sort.row >= 0 && client.sort.row <= 3)
		{
			switch(parseInt(client.sort.row))
			{
				case 0:
					conf.sorting.sort_by = 'name'; break;
				case 1:
					conf.sorting.sort_by = 'modified'; break;
				case 2:
					conf.sorting.sort_by = 'size'; break;
				case 3:
					conf.sorting.sort_by = 'type'; break;
			}

			conf.sorting.enabled = true;
		}

		if(client.sort.ascending === 0 || client.sort.ascending === 1)
		{
			conf.sorting.order = (client.sort.ascending === 1 ? 'asc' : 'desc');
			conf.sorting.enabled = true;
		}
	}

	return conf;
};

/* Converts a path into clickable HTML elements. */
module.exports.clickablePath = (p) =>
{
	var parts = module.exports.trim.both(p, '/').split('/'), built = '<a href="/">/</a>';

	parts.forEach((part, index) =>
	{
		if(!_.isEmpty(part))
		{
			built = (built + `<a href="/${parts.slice(0, index + 1).join('/')}">${((index + 1) !== 1 ? '/' : '')}${part}</a>`);
		}
	});

	return built;
};

/* Sorts an object by a key. */
module.exports.sortByKey = (obj, path, order = 'asc') =>
{
	var ascending = (order === 'asc');

	return obj.sort((a, b) =>
	{
		var value = {
			a : _.get(a, path),
			b : _.get(b, path)
		};

		return module.exports.isNumeric(value.a) && module.exports.isNumeric(value.b) ? 
			(ascending) ? (value.a - value.b) : (value.b - value.a) : 
			(ascending) ? (value.a).localeCompare(value.b) : (value.b).localeCompare(value.a);
	});
};

/* Calculates a timestamp with a offset. */
module.exports.calculateOffset = (offset, timestamp = null) =>
{
	return (timestamp ? timestamp : (Math.floor(new Date() / 1000))) + (offset > 0 ? -Math.abs(offset) : Math.abs(offset));
};

/* Checks if a path is above another path. */
module.exports.isAbovePath = (base, path) =>
{
	var b = path.startsWith(base);

	return b ? b : (base === path ? true : false);
};

/* Calculates render time (process.hrtime()). */
module.exports.getExecutionTime = (t) =>
{
	return (t[0] + (t[1] / 1e9)).toFixed(6);
};

/* Async .forEach function. */
module.exports.asyncForEach = async (array, callback) =>
{
	for(let index = 0; index < array.length; index++)
	{
		await callback(array[index], index, array);
	}
};

/* Formats a byte integer to a readable format.
 * https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string
 */
module.exports.getReadableSize = (bytes = 0) =>
{
	var format = config.get().format.sizes;

	if(bytes === 0) return '0.00' + format[0];

	var i = 0;

	do {
		bytes = bytes / 1024; i++;
	} while (bytes > 1024);

	return Math.max(bytes, 0.1).toFixed(i < 2 ? 0 : 2) + format[i];
};

/* Checks if a variable is numeric. */
module.exports.isNumeric = (n) =>
{
	return !isNaN(parseFloat(n)) && isFinite(n);
};

/* Trimming functions. */
module.exports.trim = {
	left : (s, char) =>
	{
		return s.startsWith(char) ? s.substr(1) : s;
	},
	right : (s, char) =>
	{
		return s.endsWith(char) ? s.slice(0, -1) : s;
	},
	both : (s, char) =>
	{
		return module.exports.trim.right(module.exports.trim.left(s, char), char);
	}
}

/* Adds a trailing character to a string if it does not already exist. */
module.exports.addTrailing = (s, char) =>
{
	return s.endsWith(char) ? s : (s + char);
};

/* Adds a leading character to a string if it does not already exist. */
module.exports.addLeading = (s, char) =>
{
	return s.startsWith(char) ? s : (char + s);
};

module.exports.cookie = {
	/* Read client cookie. */
	read : (req) =>
	{
		if(_.isEmpty(req.cookies) || !req.cookies['ei-client'])
		{
			return {};
		} else {
			try
			{
				return JSON.parse(req.cookies['ei-client']);
			} catch(e)
			{
				return {};
			}
		}
	}
};

/* JS equivalent of PHP's 'date'. */
module.exports.dates = {
	/*
	 * https://github.com/kvz/locutus/blob/master/src/php/datetime/date.js
	 * Copyright (c) 2007-2016 Kevin van Zonneveld (https://kvz.io) )
	 */
	date : (format, timestamp) =>
	{
		var jsdate, f, txtWords = [
			'Sun', 'Mon', 'Tues', 'Wednes', 'Thurs', 'Fri', 'Satur',
			'January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December'
		], formatChr = /\\?(.?)/gi;

		var formatChrCb = (t, s) => f[t] ? f[t]() : s;

		var _pad = (n, c) =>
		{
			n = String(n);
			while(n.length < c) n = '0' + n;
			return n;
		};

		f = {
			d: () => _pad(f.j(), 2),
			D: () => f.l().slice(0, 3),
			j: () => jsdate.getDate(),
			l: () => txtWords[f.w()] + 'day',
			N: () => f.w() || 7,
			S: () =>
			{
				var j = f.j(),
					i = j % 10;

				if(i <= 3 && parseInt((j % 100) / 10, 10) === 1) i = 0;

				return ['st', 'nd', 'rd'][i - 1] || 'th';
			},
			w: () => jsdate.getDay(),
			z: () =>
			{
				var a = new Date(f.Y(), f.n() - 1, f.j()),
					b = new Date(f.Y(), 0, 1);

				return Math.round((a - b) / 864e5);
			},
			W: () =>
			{
				var a = new Date(f.Y(), f.n() - 1, f.j() - f.N() + 3),
					b = new Date(a.getFullYear(), 0, 4);

				return _pad(1 + Math.round((a - b) / 864e5 / 7), 2);
			},
			F: () => txtWords[6 + f.n()],
			m: () => _pad(f.n(), 2),
			M: () => f.F().slice(0, 3),
			n: () => jsdate.getMonth() + 1,
			t: () => (new Date(f.Y(), f.n(), 0)).getDate(),
			L: () =>
			{
				var j = f.Y();

				return j % 4 === 0 & j % 100 !== 0 | j % 400 === 0;
			},
			o: () =>
			{
				var n = f.n(),
					W = f.W(),
					Y = f.Y();

				return Y + (n === 12 && W < 9 ? 1 : n === 1 && W > 9 ? -1 : 0);
			},
			Y: () => jsdate.getFullYear(),
			y: () => f.Y().toString().slice(-2),
			a: () => jsdate.getHours() > 11 ? 'pm' : 'am',
			A: () => f.a().toUpperCase(),
			B: () =>
			{
				var H = jsdate.getUTCHours() * 36e2,
					i = jsdate.getUTCMinutes() * 60,
					s = jsdate.getUTCSeconds();

				return _pad(Math.floor((H + i + s + 36e2) / 86.4) % 1e3, 3);
			},
			g: () => f.G() % 12 || 12,
			G: () => jsdate.getHours(),
			h: () => _pad(f.g(), 2),
			H: () => _pad(f.G(), 2),
			i: () => _pad(jsdate.getMinutes(), 2),
			s: () => _pad(jsdate.getSeconds(), 2),
			u: () => _pad(jsdate.getMilliseconds() * 1000, 6),
			I: () =>
			{
				var a = new Date(f.Y(), 0),
					c = Date.UTC(f.Y(), 0),
					b = new Date(f.Y(), 6),
					d = Date.UTC(f.Y(), 6);

				return ((a - c) !== (b - d)) ? 1 : 0;
			},
			O: () =>
			{
				var tzo = jsdate.getTimezoneOffset(),
					a = Math.abs(tzo);

				return (tzo > 0 ? '-' : '+') + _pad(Math.floor(a / 60) * 100 + a % 60, 4);
			},
			P: () =>
			{
				var O = f.O();

				return (O.substr(0, 3) + ':' + O.substr(3, 2));
			},
			T: () => 'UTC',
			Z: () => -jsdate.getTimezoneOffset() * 60,
			c: () => 'Y-m-d\\TH:i:sP'.replace(formatChr, formatChrCb),
			r: () => 'D, d M Y H:i:s O'.replace(formatChr, formatChrCb),
			U: () => jsdate / 1000 | 0
		};

		var _date = (format, timestamp) =>
		{
			jsdate = (timestamp === undefined ? new Date()
				: (timestamp instanceof Date) ? new Date(timestamp)
				: new Date(timestamp * 1000)
			);

			return format.replace(formatChr, formatChrCb);
		};

		return _date(format, timestamp);
	},
	gmdate : (format, timestamp) =>
	{
		var dt = typeof timestamp === 'undefined' ? new Date()
		: timestamp instanceof Date ? new Date(timestamp)
		: new Date(timestamp * 1000)

		timestamp = Date.parse(dt.toUTCString().slice(0, -4)) / 1000

		return module.exports.dates.date(format, timestamp)
	}
};

/* Lodash functions. */
module.exports.obj = {
	get : (obj, path, def = null) =>
	{
		return _.get(obj, path, def);
	},
	has : (obj, path) =>
	{
		return _.has(obj, path);
	},
	set : (obj, path, value) =>
	{
		return _.set(obj, path, value);
	},
	merge : (source, master) =>
	{
		return _.merge(source, master);
	},
	omit : (obj, path) =>
	{
		return _.omit(obj, path);
	},
	clone : (obj) =>
	{
		return _.cloneDeep(obj);
	}
};

module.exports.config = config;