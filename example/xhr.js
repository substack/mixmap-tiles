var mixmap = require('../')
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
