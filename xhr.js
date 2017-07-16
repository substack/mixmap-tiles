var xhr = require('xhr')

module.exports = function (file, cb) {
  var opts = { url: file, responseType: 'arraybuffer' }
  xhr(opts, function (err, res, body) {
    if (err) return cb(err)
    else if (!/^2/.test(res.statusCode)) {
      return cb(new Error('status code ' + res.statusCode))
    } else cb(null, { type: res['content-type'], data: body })
  })
}
