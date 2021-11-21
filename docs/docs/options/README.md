# Options

An `{object}` containing configurable options can be passed to the indexer in order to customize it.

This page contains the full documentation of the available options.

An example of how to pass options:
```javascript
const nodexer = require('nodexer');

let server = nodexer.run(port, directory, {
    // Configurable options {object}.
})
```

## authentication
### *authentication.users*
An object containing users.
```javascript
{
    authentication: {
        users: {
            'user1': 'password'
        }
    }
}
```
type: `{object}`
default: `null`

## format
### *format.sizes*
Unit display of file sizes.
```javascript
{
    format: {
        sizes: [' B', ' kB', ' MB', ' GB', ' TB']
    }
}
```
type: `<array>`
default: `[' B', ' kB', ' MB', ' GB', ' TB']`

---

### *format.date*
Date format as per [function.date.php](https://www.php.net/manual/en/function.date.php).

First key is the desktop format, second key is the mobile format.
```javascript
{
    format: {
        date: ['d/m/y H:i', 'd/m/y']
    }
}
```
type: `<array>`
default: `['d/m/y H:i', 'd/m/y']`

---

## sorting
### *sorting.enabled*
If default sorting options should be enabled. This only applies to default sorting, it will always be enabled if the client has any sorting preferences set.
```javascript
{
    sorting: {
        enabled: false
    }
}
```
default: `false`

---

### *sorting.types*
What item types that should be sortable.

`0` = Both. `1` = Files only. `2` = Directories only.
```javascript
{
    sorting: {
        types: 0
    }
}
```
type: `[integer]`
default: `0`

---

### *sorting.sort_by*
What to sort by.

Available options are `'name'`, `'modified'`, `'type'` and `'size'`.
```javascript
{
    sorting: {
        sort_by: 'name'
    }
}
```
type: `'string'`
default: `'name'`

---

### *sorting.ascending*
Sorting order.

`1` = Ascending. `0` = Descending.
```javascript
{
    sorting: {
        ascending: 1
    }
}
```
type: `[integer]`
default: `1`


## gallery
### *gallery.enabled*
Enables or disables the gallery mode.
```javascript
{
    gallery: {
        enabled: true
    }
}
```
type: `[boolean]`
default: `true`

---

### *gallery.fade*
Fade duration in `ms` when navigating the gallery. `0` will disable the effect.
```javascript
{
    gallery: {
        fade: 0
    }
}
```
type: `[integer]`
default: `0`

---

### *gallery.reverse_options*
Whether gallery images should have reverse search options or not.
```javascript
{
    gallery: {
        reverse_options: false
    }
}
```
type: `[boolean]`
default: `false`

---

### *gallery.scroll_interval*
Adds a forced break between scroll events in the gallery (`ms`).
```javascript
{
    gallery: {
        scroll_interval: 50
    }
}
```
type: `[integer]`
default: `50`

---

### *gallery.list_alignment*
Gallery list alignment where `0` is right and `1` is left.
```javascript
{
    gallery: {
        list_alignment: 0
    }
}
```
type: `[integer]`
default: `0`

---

### *gallery.fit_content*
If images and videos should be forced to fill the available screen space.
```javascript
{
    gallery: {
        fit_content: false
    }
}
```
type: `[boolean]`
default: `false`

## preview
### *preview.enabled*
This will display a hoverable preview on videos and images if enabled.
```javascript
{
    preview: {
        enabled: true
    }
}
```
type: `[boolean]`
default: `true`

---

### *preview.hover_delay*
How long in `ms` before the preview is being shown after hovering.
```javascript
{
    preview: {
        hover_delay: 75
    }
}
```
type: `[integer]`
default: `75`

---

### *preview.window_margin*
Forces a `px` margin between the preview and the edges of the viewport.
```javascript
{
    preview: {
        window_margin: 0
    }
}
```
type: `[integer]`
default: `0`

---

### *preview.cursor_indicator*
Displays a loading cursor while the preview is loading.
```javascript
{
    preview: {
        cursor_indicator: true
    }
}
```
type: `[boolean]`
default: `true`

---

### *preview.static*
Whether the preview should follow the cursor or not.
```javascript
{
    preview: {
        static: true
    }
}
```
type: `[boolean]`
default: `true`

## media
### *media.extensions*
This setting decides which extensions will be marked as `media`.

This means that the extensions included here *will* have previews and *will* be included in the gallery mode.

type: `{object}`

- ### *media.extensions.image*
    Extensions marked as `image`.

    type: `<array>`
    default: `['jpg', 'jpeg', 'gif', 'png', 'ico', 'svg', 'bmp', 'webp']`


- ### *media.extensions.video*
    Extensions marked as `video`.

    type: `<array>`
    default: `['webm', 'mp4']`

Example:
```javascript
{
    extensions: {
        image: ['jpg', 'jpeg', 'gif', 'png', 'ico', 'svg', 'bmp', 'webp'],
        video: ['webm', 'mp4'],
    }
}
```

## style
Styling options. 

These options can be changed by the client by opening the settings menu (top right corner).
### *style.themes*
type: `{object} | <array>`

- ### *style.themes.path*
    Can be set to a path containing `.css` files. Every `.css` in the set folder will be treated as a separate theme.

    type: `'string'`

- ### *style.themes.default*
    Optional. A theme that will be used as default for any new clients. Takes a filename without the `.css` extension.

    type: `'string'`

    Example:
    ```javascript
    {
        style: {
            themes: {
                path: '/themes/',
                default: 'themeName'
            }
        }
    }
    ```

---

### *style.compact*
Enables a more compact and centered style.
```javascript
{
    style: {
        compact: false
    }
}
```
type: `[boolean]`
default: `false`

## filter
### *filter.file*
A `regex` used when filtering out files.

Every filename *passing* the `regex` will be shown.
```javascript
{
    filter: {
        file: false
    }
}
```
type: `'string' | [boolean]`
default: `false`

---

### *filter.directory*
A `regex` used when filtering out directories.

Every directory name *passing* the `regex` will be shown.
```javascript
{
    filter: {
        directory: false
    }
}
```
type: `'string' | [boolean]`
default: `false`

---

### *filter.sensitive*
Whether the `regex` used when filtering should be case-sensitive or not.
```javascript
{
    filter: {
        sensitive: false
    }
}
```
type: `[boolean]`
default: `false`

## readme
### *readme.enabled*
Whether `README.md` files should be parsed and displayed as a notice above the list of files.
```javascript
{
    readme: {
        enabled: true
    }
}
```
type: `[boolean]`
default: `true`

---

### *readme.hidden*
Automatically hides the `README.md` file from the list of files.
```javascript
{
    readme: {
        hidden: false
    }
}
```
type: `[boolean]`
default: `false`

## exclude
Separate from the filter.

These extensions will be *completely* excluded from the file list and will also not be directly accessible as a URL.

Example:
```javascript
{
    exclude: ['exe', '7z', 'jpg']
}
```
type: `<array>`
default: `null`

## debug
Enables some very basic `console.log()` output in the browser.

Example:
```javascript
{
    debug: false
}
```
type: `[boolean]`
default: `false`