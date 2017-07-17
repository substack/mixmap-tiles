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
