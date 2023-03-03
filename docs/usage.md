<h1 align="center">Usage</h1>

<br/>

## Quick Setup
Install the package:
```bash
npm install ivfi
```

Import the package and start the Indexer:
```js
/** Import IVFi */
import ivfi from 'ivfi';

/** Variables */
const port = 4000,
    directory = '/mnt/e/Streamers/',
    options = {};

(async () =>
{
    /** Start server */
    const server = await ivfi.run(port, directory, options);
})();
```

## Server Functions

### ivfi.run()

Starts a server with the Indexer on the set port browsing the set directory.

To see what options can be passed see [options](configuration.md).

Returns the `server` instance.

```js
import ivfi from 'ivfi';

let server = ivfi.run(port, directory, options = {})
```
* port: `[integer]`
* directory: `'string'`
* options: `{object}`

#### Returns: `{Object}`

---

### server.switch()
Changes the root directory of the Indexer.
```js
server.switch(directory)
```
* directory: `'string'`

---

### server.stop()
Stops the server.
```js
server.stop()
```

---

### server.start()
Starts the server.
```js
server.start()
```