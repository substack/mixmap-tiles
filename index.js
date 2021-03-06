var idlecb = window.requestIdleCallback
  || function (f) { setTimeout(f,0) }

module.exports = function (map, opts) {
  var layers = opts.layers
  var load = opts.load
  var dir = opts.path || ''
  var drawOpts = Object.assign({
    frag: `
      precision highp float;
      uniform sampler2D texture;
      varying vec2 vtcoord;
      void main () {
        float q = 1.0/32.0;
        vec3 c = vec3(max(mod(vtcoord.x,q),mod(vtcoord.y,q))*0.4+0.4);
        vec4 tc = texture2D(texture,vtcoord);
        gl_FragColor = vec4(c*(1.0-tc.a)+tc.rgb*tc.a,0.5+tc.a*0.5);
      }
    `,
    vert: `
      precision highp float;
      attribute vec2 position;
      uniform vec4 viewbox;
      uniform vec2 offset;
      uniform float zindex, aspect;
      attribute vec2 tcoord;
      varying vec2 vtcoord;
      void main () {
        vec2 p = position + offset;
        vtcoord = tcoord;
        gl_Position = vec4(
          (p.x - viewbox.x) / (viewbox.z - viewbox.x) * 2.0 - 1.0,
          ((p.y - viewbox.y) / (viewbox.w - viewbox.y) * 2.0 - 1.0) * aspect,
          1.0/(2.0+zindex), 1);
      }
    `,
    uniforms: Object.assign({
      zindex: map.prop('zindex'),
      texture: map.prop('texture')
    }, opts.uniforms),
    attributes: Object.assign({
      position: map.prop('points'),
      tcoord: [0,1,0,0,1,1,1,0] // sw,se,nw,ne
    }, opts.attributes),
    elements: [0,1,2,1,2,3],
    blend: {
      enable: true,
      func: { src: 'src alpha', dst: 'one minus src alpha' }
    }
  }, opts)
  delete drawOpts.load
  delete drawOpts.path
  delete drawOpts.layers
  var drawTile = map.createDraw(drawOpts)

  var queue = []
  function enqueue (key, fn) {
    queue.push({key:key,fn:fn})
    if (queue.length === 1) next()
    function next () {
      if (queue[0]) queue[0].fn(function () {
        setTimeout(function () {
          idlecb(function () {
            queue.shift()
            next()
          })
        }, 20)
      })
    }
  }
  var layer = map.addLayer({
    viewbox: function (bbox, zoom, cb) {
      zoom = Math.round(zoom)
      if (typeof layers === 'function') {
        return layers(bbox, zoom, cb)
      }
      var result = {}
      for (var i = 0; i < layers.length; i++) {
        if (zoom >= layers[i].zoom) {
          var keys = Object.keys(layers[i].tiles)
          for (var j = 0; j < keys.length; j++) {
            var key = keys[j]
            var zkey = layers[i].zoom + '!' + key
            result[zkey] = layers[i].tiles[key]
          }
        }
      }
      cb(null, result)
    },
    add: function (key, bbox) {
      var zoom = Number(key.split('!')[0])
      var file = key.replace(/^\d+!/,'')
      var prop = {
        key: key,
        zindex: 1 + zoom,
        texture: map.regl.texture(),
        points: [
          bbox[0], bbox[1], // sw
          bbox[0], bbox[3], // se
          bbox[2], bbox[1], // nw
          bbox[2], bbox[3]  // ne
        ]
      }
      drawTile.props.push(prop)
      map.draw()
      load((dir ? dir + '/' : '') + file, function (err, res) {
        if (err) return console.error(err)
        enqueue(key, function (cb) {
          var img = new Image
          var blob = new Blob([res.data])
          img.onload = function () {
            prop.texture = map.regl.texture(img)
            map.draw()
            cb()
          }
          img.onerror = function () {
            cb()
          }
          img.src = URL.createObjectURL(blob)
        })
      })
    },
    remove: function (key, bbox) {
      drawTile.props = drawTile.props.filter(function (p) {
        return p.key !== key
      })
      queue = queue.filter(function (q,i) {
        return i === 0 || q.key !== key
      })
    }
  })
  return { draw: drawTile, layer: layer }
}
