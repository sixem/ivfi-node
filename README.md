<br/>
<div align="center">
	<img height="100" src="./logo.svg">
	<br/><br/>
	<h3 align="center">IVFi-Node</h3>
	<p align="center"><i>The image and video friendly indexer</i></p>
</div>

<br/>

<p align="center">
<img alt="npm" src="https://img.shields.io/npm/v/ivfi?style=flat-square"> <img alt="Travis (.com)" src="https://img.shields.io/travis/com/sixem/ivfi-node?style=flat-square">
</p>

<br/>

<p align="center">
	<a href="https://index.five.sh/">Demo</a>&nbsp;&nbsp;
	<a href="https://ivfi.io/docs/node/#/README">Documentation</a>&nbsp;&nbsp;
	<a href="https://ivfi.io/docs/node/#/configuration">Configuration</a>&nbsp;&nbsp;
	<a href="https://ivfi.io/docs/node/#/building">Building</a>
</p>

<br/><br/>

# About
IVFi-Node is a file directory browser script made in Node and TypeScript.

It is designed to be a comprehensive indexer, with a focus on efficiently handling image and video files. IVFi has a modern and user-friendly interface, offering features such as a gallery view, hoverable previews, and many customization options.

This project can be easily set up on most web servers.

<br/>

# Quick setup :zap:
### Install via npm
```shell
npm install ivfi
```

## Usage
Import package:
```js
import ivfi from 'ivfi';
```
Basic initialization example:
```js
const port = 3000;
const directory = '/var/www/html/';
const options = {};
    
(async () =>
{
    /** Start server */
    const server = await ivfi.run(port, directory, options);
})();
```
This will spin up a webserver on `http://localhost:3000/` with the path set to `/var/www/html/`.

A documentation of the available options can be found [here](https://ivfi.io/docs/node/#/configuration).

# Development

Clone the repository and install the required `npm` packages:
```shell
git clone https://github.com/sixem/ivfi-node
cd ivfi-node
npm install
```
Create a `run.ts` file with a simple initialization of the script:
```js
import ivfi from './src/index';

const port = 3000;
const directory = '/var/www/html/';

const server = ivfi(__dirname);

server.run(port, directory, {
	debug: true
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

# Building
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