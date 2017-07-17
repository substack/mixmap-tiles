var mixmap = require('mixmap')
var glsl = require('glslify')
var xhr = require('xhr')

var mix = mixmap(require('regl'))
var map = mix.create()

var urlt = 'http://a.tile.osm.org/{z}/{x}/{y}.png'

var mixtiles = require('../')
var tiles = mixtiles(map, {
  layers: function (bbox, zoom, cb) {
    var z = Math.pow(2,zoom-1)
    var x0 = Math.max(0,Math.floor(((bbox[0]+180+360)%360)/360 * z))
    var x1 = Math.ceil(((bbox[2]+180+360)%360)/360 * z)
    var y0 = Math.max(0,Math.floor((bbox[1]+90)/180 * z))
    var y1 = Math.ceil((bbox[3]+90)/180 * z)
    var vars = { x: 0, y: 0, z: zoom-1 }
    var boxes = {}
    for (var y = y0; y < y1; y++) {
      vars.y = y
      for (var x = x0; x <= x1; x++) {
        vars.x = x
        var u = urlt.replace(/{(\w+)}/g, function (_,name) {
          return vars[name]
        })
        boxes[zoom+'!'+u] = [
          x/z*360-180,
          (1-(y+1)/z)*(85.0511*2)-85.0511,
          (x+1)/z*360-180,
          (1-y/z)*(85.0511*2)-85.0511
        ]
      }
    }
    cb(null, boxes)
  },
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
