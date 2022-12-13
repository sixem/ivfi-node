<br/>
<p align="center">
  <img height="100" src="./icon.svg">
</p>
<br/>
<h2 align="center">The image and video friendly indexer</h2>

<p align="right">
	<img alt="npm" src="https://img.shields.io/npm/v/ivfi"> <img src="https://app.travis-ci.com/sixem/ivfi-node.svg?branch=master&amp;status=passed" alt="build:passed">
</p>

IVFi is a directory lister that aims to make it easy to browse web-based directories.

The Indexer is designed to look appealing while also being easy to use. It works with any type of directory, but it has a special focus on image and video files. This is reflected in the many media friendly features it has, where the most prominent ones are hoverable previews and a complete gallery view mode.
<br/><br/>
You can view a demo of the script [here](https://index.five.sh/).

## Documentation
:link: <https://ivfi.io/docs/node/>

## Quick setup
### Install via npm
```shell
npm install ivfi
```

### Usage
Import package:
```js
import ivfi from 'ivfi';
```
Basic initialization example:
```js
const port = 3000;
const directory = '/var/www/html/';
const options = {};
    
const server = ivfi.run(port, directory, options);
```
This will spin up a webserver on `http://localhost:3000/` with the path set to `/var/www/html/`.

A documentation of the available options can be found [here](https://ivfi.io/docs/node/#/configuration).

## Development

Clone the repository and install the required `npm` packages:
```shell
git clone https://github.com/sixem/ivfi-node
cd ivfi-node
npm install
```
Create a `run.ts` file with a simple initialization of the script:
```js
import ivfi from './src/index';

const port = 3000, directory = '/var/www/html/';
const server = ivfi(__dirname);

server.run(port, directory, {
	debug : true
});
```
Build the `dist` files that are used on the client side:
```bash
npm run compile:development
```
Start the server:
```js
node --loader ts-node/esm run.ts
```
Any changes made to the client side code, will require a recompiled `dist` directory, while any changes made to the server side code will simply require a restart of the server.

## Building
To package the project:
```bash
npm run transpile:pack
```
This will create a new directory with the packaged script.

## Other Projects
This is a Node version of the image and video friendly indexer (IVFi).

For other non-node versions, see: [https://ivfi.io/](https://ivfi.io/)
## Disclaimer
As always, use this script at your own risk. There may exist bugs that i do not know of.