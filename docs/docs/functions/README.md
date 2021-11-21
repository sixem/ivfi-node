# Functions

## nodexer.run()
```javascript
const nodexer = require('nodexer');

let server = nodexer.run(port, directory, options = {})
```
* port: `[integer]`
* directory: `'string'`
* options: `{object}`

Starts a webserver with the indexer on the set port browsing the set directory.

To see what options can be passed see [options](/docs/options/).

Returns the `server` instance.

#### Returns: `Object`

## server.switch()
Changes the directory of the indexer.
```javascript
server.switch(directory)
```
* directory: `'string'`

## server.stop()
Stops the webserver.
```javascript
server.stop()
```

## server.start()
Starts the webserver.
```javascript
server.start()
```