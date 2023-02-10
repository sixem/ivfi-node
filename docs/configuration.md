<h1 align="center">Options</h1>
<p align="center">
IVFi-Node supports a variety of options. An object containing configurable variables can be passed to the script during initialization.<br/><br/>This page contains the full documentation of the available options.
</p>
<br/>

## Example
A basic example of some options being passed to the script:
```js
/** Import the package */
import ivfi from 'ivfi';

/** Init variables */
const port = 3000,
    directory = '/mnt/files';

/** Customizable options */
const options = {
    debug: true,
    gallery: {
        enabled: true
    },
    preview: {
        enabled: true
    }
};

/** Start the server */
const server = ivfi.run(port, directory, options);
```

<br/><br/>

# Authentication
### *authentication → users*
An object containing users.
```js
Options {
    authentication: {
        users: {
            'user': 'password'
        }
    }
}
```
- type: `{object}`
default: `null`

<br/><br/>

# Format
### *format → sizes*
Unit display of file sizes.
```js
Options {
    format: {
        sizes: [' B', ' kiB', ' MiB', ' GiB', ' TiB']
    }
}
```
- type: `<array>`
default: `[' B', ' kiB', ' MiB', ' GiB', ' TiB']`

---

### *format → date*
Date format as per [function.date.php](https://www.php.net/manual/en/function.date.php).

First key is the desktop format, second key is the mobile format.
```js
Options {
    format: {
        date: ['d/m/y H:i', 'd/m/y']
    }
}
```
- type: `<array>`
default: `['d/m/y H:i', 'd/m/y']`

---

<br/><br/>

# Sorting
### *sorting → enabled*
If default sorting options should be enabled.

This only applies to default sorting, it will always be enabled if the client has any sorting preferences set.
```js
Options {
    sorting: {
        enabled: false
    }
}
```
default: `false`

---

### *sorting → types*
What item types that should be sortable.

`0` = Both. `1` = Files only. `2` = Directories only.
```js
Options {
    sorting: {
        types: 0
    }
}
```
- type: `[integer]`
default: `0`

---

### *sorting → sortBy*
Default sorting state.

Available options are `'name'`, `'modified'`, `'type'` and `'size'`.
```js
Options {
    sorting: {
        sortBy: 'name'
    }
}
```
- type: `'string'`
default: `'name'`

---

### *sorting → ascending*
Default sorting order.

`1` = Ascending. `0` = Descending.
```js
Options {
    sorting: {
        ascending: 1
    }
}
```
- type: `[integer]`
default: `1`

<br/><br/>

# Gallery
### *gallery → enabled*
Enables or disables the gallery mode.
```js
Options {
    gallery: {
        enabled: true
    }
}
```
- type: `[boolean]`
default: `true`

---

### *gallery → reverseOptions*
Whether gallery images should have reverse search options or not.
```js
Options {
    gallery: {
        reverseOptions: false
    }
}
```
- type: `[boolean]`
default: `false`

---

### *gallery → scrollInterval*
Adds a forced break between scroll events in the gallery (`ms`).
```js
Options {
    gallery: {
        scrollInterval: 50
    }
}
```
- type: `[integer]`
default: `50`

---

### *gallery → listAlignment*
Gallery list alignment where `0` is right and `1` is left.
```js
Options {
    gallery: {
        listAlignment: 0
    }
}
```
- type: `[integer]`
default: `0`

---

### *gallery → fitContent*
If images and videos should be forced to fill the available screen space.
```js
Options {
    gallery: {
        fitContent: true
    }
}
```
- type: `[boolean]`
default: `false`

<br/><br/>

# Preview
### *preview → enabled*
This will display a hoverable preview on videos and images if enabled.
```js
Options {
    preview: {
        enabled: true
    }
}
```
- type: `[boolean]`
default: `true`

---

### *preview → hoverDelay*
How long in `ms` before the preview is being shown after hovering.
```js
Options {
    preview: {
        hoverDelay: 75
    }
}
```
- type: `[integer]`
default: `75`

---

### *preview → cursorIndicator*
Displays a loading cursor while the preview is loading.
```js
Options {
    preview: {
        cursorIndicator: true
    }
}
```
- type: `[boolean]`
default: `true`

<br/><br/>

# Media
### *media → extensions*
This setting decides which extensions will be marked as `media`.

This means that the extensions included here *will* have previews and *will* be included in the gallery mode.

- type: `{object}`

- ### *media → extensions → image*
    Extensions marked as `image`.

    - type: `<array>`
    default: `['jpg', 'jpeg', 'gif', 'png', 'ico', 'svg', 'bmp', 'webp']`


- ### *media → extensions → video*
    Extensions marked as `video`.

    - type: `<array>`
    default: `['webm', 'mp4', 'ogv', 'ogg', 'mov']`

Example:
```js
Options {
    media: {
        extensions: {
            image: ['jpg', 'jpeg', 'gif', 'png', 'ico', 'svg', 'bmp', 'webp'],
            video: ['webm', 'mp4', 'ogv', 'ogg', 'mov']
        }
    }
}
```

<br/><br/>

# Style
Styling options. 

These options can be changed by the client by opening the settings menu (top right corner).
### *style → themes*
- type: `{object} | <array>`

- ### *style → themes → path*
    Can be set to an absolute path containing themes.
    
    Every `.css` in the set folder (or its child folders) will be treated as a separate theme.

    - type: `'string'`

- ### *style → themes → default*
    Optional.
    
    A theme that will be used as default for any new clients. Takes a theme name *without* the `.css` extension.

    - type: `'string'`

Example:
```js
Options {
	style: {
	    themes: {
		path: '/mnt/backend/themes/',
		default: 'themeName'
	    }
	}
}
```

---

### *style → compact*
Enables a more compact and centered style.
```js
Options {
    style: {
        compact: false
    }
}
```
- type: `[boolean]`
default: `false`

<br/><br/>

# Filter
### *filter → file*
A `regex` used when filtering out files.

Every filename *passing* the `regex` will be shown.
```js
Options {
    filter: {
        file: false
    }
}
```
- type: `'string' | [boolean]`
default: `false`

---

### *filter → directory*
A `regex` used when filtering out directories.

Every directory name *passing* the `regex` will be shown.
```js
Options {
    filter: {
        directory: false
    }
}
```
- type: `'string' | [boolean]`
default: `false`

<br/><br/>

# README
### *readme → enabled*
Whether `README.md` files should be parsed and displayed as a notice above the list of files.
```js
Options {
    readme: {
        enabled: true
    }
}
```
- type: `[boolean]`
default: `true`

---

### *readme → hidden*
Automatically hides the `README.md` file from the list of files.
```js
Options {
    readme: {
        hidden: false
    }
}
```
- type: `[boolean]`
default: `false`

---

### *readme → toggled*
Sets the default toggled state of `README.md` content.

Example:
```js
Options {
    readme: {
        toggled: true
    }
}
```
- type: `[boolean]`
default: `true`

<br/><br/>

# Icon
### *icon → path*
A path to an icon that the template engine should use.
```js
Options {
    icon: {
        path: '/favicon.png'
    }
}
```
- type: `'string'`
default: `null`

---

### *icon → mime*
The icons MIME type.
```js
Options {
    icon: {
        mime: 'image/png'
    }
}
```
- type: `'string'`
default: `null`

<br/><br/>

# Exclude
Separate from the filter.

These extensions will be *completely* excluded from the file list and will also not be directly accessible as a URL.

Example:
```js
Options {
    exclude: ['exe', '7z', 'jpg']
}
```
- type: `<array>`
default: `null`

<br/><br/>

# Performance
Configures the performance mode.

This mode hides elements that are out of view, increasing the performance for larger directories.

Setting it to `true` or `false` will enable or disable it respectively. Setting it to an `integer` will enable it if the directory contains more files than the set value.

Example:
```js
Options {
    performance: 100
}
```
- type: `[integer]`
default: `100`

<br/><br/>

# Processor
Enables the manipulation of the data that is being passed to the template engine.

Example:
```js
Options {
    processor: (data) =>
    {
        const timestamp = Math.round(+new Date() / 1000);

        let hidden = 0;

        data.contents.files = data.contents.files.map((file) =>
        {
            /** Adds a query parameter to every file URL */
            file.relative = `${file.relative}?v=${timestamp}`;

            /** Hides any files ending with `.jpg` */
            if((file.name).toLowerCase().endsWith('.jpg'))
            {
                file.hidden = true;
                hidden++;
            }

            return file;
        });

        /** Update the file count */
        data.count.files = (data.count.files - hidden);

        /** Return the manipulated data */
        return data;
    }
}
```
- type: `function`
default: `null`

<br/><br/>

# Debug
Enables server and browser logging.

Example:
```js
Options {
    debug: false
}
```
- type: `[boolean]`
default: `false`