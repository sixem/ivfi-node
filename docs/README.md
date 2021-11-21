# nodexer

<img alt="npm" src="https://img.shields.io/npm/v/nodexer?style=flat-square">  <img alt="Travis (.com)" src="https://img.shields.io/travis/com/sixem/nodexer?style=flat-square">

A directory indexer written in Node.

This is a highly customizable indexer with good support for mainly image and video files while also having most of the basic features of any other directory lister. It has a gallery mode, hoverable previews and persistent user-set settings like sorting and other small adjustments. It is also designed to have a slightly retro and simple feel to it which is why it does not use any flashy CSS or icon packs.
<br><br>

You can view a demo of the script [here](https://index.five.sh/).

Please note that this is a very early version of this project, so it may contain a few bugs.

# Install
## NPM <!-- {docsify-ignore} -->
```bash
npm install nodexer
```

# Usage
Require Nodexer:
```javascript
const nodexer = require('nodexer');
```
Basic initialization example:
```javascript
var server = nodexer.run(3000, '/var/www/html/');
```
This will spin up a webserver on `http://localhost:3000/` with the path set to `/var/www/html/`.
<br><br>
Another example. This time with a windows path and a few options set:
```javascript
var server = nodexer.run(3000, 'E:/Downloads', {
	authentication : {
		users: {
			'username': 'password'
		}
	},
	gallery : {
		fit_content : true
	},
	style : {
		compact : true
	}
});
```
This will also start a webserver on `http://localhost:3000/` with the path set to `E:/Downloads`. In this example it'll also enable a basic authentication system and a few other options options.

A documentation of the available options can be found [here](https://github.com/sixem/nodexer/wiki/Documentation#options).

# Development

*Note: The development environment utilizes ES6.*

Clone the repository and install the required `npm` packages:
```
git clone https://github.com/sixem/nodexer
cd nodexer
npm install
```
Create a `run.js` file with a simple initialization of the script:
```javascript
var port = 3000, directory = '/var/www/html/';

require('./index.js').run(port, directory, {
	debug : true
});
```
Then start `run.js` through `nodemon`:
```
npm run dev
```
# Compile
To compile the script run:
```
npm run compile
```
Hopefully everything looks OK. This will create a `lib` and a `dist` directory with the transpiled and minified files.

To use the compiled source, edit `.env` and change the environment from `development` to `production`:
```
NODE_ENV=production
```
## Other Projects <!-- {docsify-ignore} -->
This is a node version of the [eyy-indexer](https://github.com/sixem/eyy-indexer) which is written in PHP, so check that project out if you want something for PHP.
## Disclaimer <!-- {docsify-ignore} -->
As always, use this script at your own risk. There may exist bugs that i do not know of.