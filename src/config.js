'use strict';

const f = require('./functions.js');

var config = {
	processor : null,
	format : {
		sizes : [' B', ' kB', ' MB', ' GB', ' TB'],
		date : ['d/m/y H:i', 'd/m/y']
	},
	sorting:
	{
		enabled : false,
		types : 0,
		sort_by : 'name',
		ascending : 1
	},
	gallery :
	{
		enabled : true,
		fade : 0,
		reverse_options : false,
		scroll_interval : 50,
		list_alignment : 0,
		fit_content : false
	},
	preview:
	{
		enabled : true,
		hover_delay : 75,
		window_margin : 0,
		cursor_indicator : true,
		static : false
	},
	readme: {
		enabled: true,
		hidden: false
	},
	media : {
		extensions : {
			image : ['jpg', 'jpeg', 'gif', 'png', 'ico', 'svg', 'bmp', 'webp'],
			video : ['webm', 'mp4']
		},
	},
	style : {
		themes: false,
		compact : false
	},
	filter : {
		file : false,
		directory : false,
		sensitive : false
	},
	exclude : false,
	debug : false
};

module.exports = {
	set : (object) =>
	{
		return f.obj.merge(config, object);
	},
	insert : (path, value) =>
	{
		return f.obj.set(config, path, value);
	},
	get : (path = null, on_undefined = null) =>
	{
		return f.obj.get(config, path, !on_undefined ? config : on_undefined);
	}
};