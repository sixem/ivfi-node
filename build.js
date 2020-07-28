'use strict';

const path = require('path');
const fs = require('fs').promises;
const babel = require('@babel/core');
const chalk = require('chalk');

const minify = {
	js : require('uglify-js'),
	css : require('uglifycss')
}

var asyncForEach = async (array, callback) =>
{
	for(let index = 0; index < array.length; index++)
	{
		await callback(array[index], index, array);
	}
};

(async () =>
{
	var handler = {
		js : async (file, basename) =>
		{
			if(basename === 'vendors.js') return false;

			var binary = await fs.readFile(path.join(__dirname, file), 'binary');

			var transpiled = babel.transform(binary, {
				presets : ['@babel/preset-env']
			}).code, minified = minify.js.minify(transpiled, {
				output : {
					comments : 'some'
				}
			}).code;

			return minified;
		},
		css : async (file, basename) =>
		{
			var binary = await fs.readFile(path.join(__dirname, file), 'binary');

			return minify.css.processString(binary);
		}
	};

	await require('filehound')
	.create()
	.paths('./public')
	.find(async (err, files) =>
	{
		await asyncForEach(files, async (file) =>
		{
			file = file.replace(/\\/g, '/');

			var name = path.basename(file),
				extension = name.split('.').pop(),
				write = false;

			if(Object.prototype.hasOwnProperty.call(handler, extension))
			{
				var response = await handler[extension](file, name);

				if(response)
				{
					write = response;
				}
			}

			var split = file.split('/');

			split.shift();
			split.unshift('dist');

			var source = path.join(__dirname, file),
				output = path.join(__dirname, split.join('/'));

			try
			{
				await fs.mkdir(path.dirname(output), {
					recursive : true
				});

				if(write)
				{
					await fs.writeFile(output, write).then(() =>
					{
						console.log(`=> ${chalk.green(split.join('/'))} (${chalk.magenta('Processed')}): OK`);
					}).catch((err) =>
					{
						setTimeout(() =>
						{
							console.log(`=> ${chalk.red(split.join('/'))}: ERR`);
							throw err;
						});
					});
				} else {
					await fs.copyFile(source, output).then((e) =>
					{
						console.log(`=> ${chalk.green(split.join('/'))} (${chalk.cyan('Copied')}): OK`);
					}).catch((err) =>
					{
						setTimeout(() =>
						{
							console.log(`=> ${chalk.red(split.join('/'))}: ERR`);
							throw err;
						});
					});
				}
			} catch(e)
			{
				console.error(e, 'exiting');
				process.exit(1);
			}
		});
	});
})();