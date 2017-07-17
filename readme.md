# mixmap-tiles

tile loader for mixmap

# example

you can write a custom loader:

``` js
var mixmap = require('mixmap')
var xhr = require('xhr')

var mix = mixmap(require('regl'))
var map = mix.create()

var mixtiles = require('../')
var tiles = mixtiles(map, {
  layers: require('./layers.json'),
  load: function (file, cb) {
    var opts = { url: file, responseType: 'arraybuffer' }
    xhr(opts, function (err, res, body) {
      if (err) return cb(err)
      else if (!/^2/.test(res.statusCode)) {
        return cb(new Error('status code ' + res.statusCode))
      } else cb(null, { type: res['content-type'], data: body })
    })
  }
})

window.addEventListener('keydown', function (ev) {
  if (ev.code === 'Equal') {
    map.setZoom(Math.min(6,Math.round(map.getZoom()+1)))
  } else if (ev.code === 'Minus') {
    map.setZoom(map.getZoom()-1)
  }
})

document.body.appendChild(mix.render())
document.body.appendChild(map.render({ width: 600, height: 400 }))
```

or you can use the built-in xhr loader:

``` js
var mixmap = require('mixmap')
var xhr = require('xhr')

var mix = mixmap(require('regl'))
var map = mix.create()

var mixtiles = require('../')
var tiles = mixtiles(map, {
  layers: require('./layers.json'),
  load: require('../xhr')
})

window.addEventListener('keydown', function (ev) {
  if (ev.code === 'Equal') {
    map.setZoom(Math.min(6,Math.round(map.getZoom()+1)))
  } else if (ev.code === 'Minus') {
    map.setZoom(map.getZoom()-1)
  }
})

document.body.appendChild(mix.render())
document.body.appendChild(map.render({ width: 600, height: 400 }))
```

You can also use custom shaders to opt-out of the default fragment and vertex
shaders.

# api

``` js
var mixtiles = require('mixmap-tiles')
```

## mixtiles(map, opts)

* `opts.layers` - array of layers or `function (bbox, zoom, cb) {}`
* `opts.load` - `function (url, cb) {}` to load data

`opts.layers` can be an array of layers, each with:

* `layer.zoom` - minimum zoom level to start showing tiles
* `layer.tiles` - object mapping url keys to `[west,south,east,north]` boxes

`opts.layers` can also be a `function (bbox, zoom, cb)`. The results provided to
`cb(null, results)` should map `(zoom+'!'+url)` keys to [west,south,east,north]`
bounding box values.

Use `require('mixmap-tiles/xhr')` if you want to load tiles over xmlttprequests.

All other options are provided to `regl()` to override the default options. For
example, you can set:

* `opts.frag` - overload the default fragment shader
* `opts.vert` - overload the default vertex shader

and these options are merged into the default options:

* `opts.uniforms`
* `opts.attributes`

# install

npm install mixmap-tiles

# license

public domain
