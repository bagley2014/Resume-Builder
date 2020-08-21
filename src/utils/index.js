var fs = require('fs')

exports.schema = JSON.parse(fs.readFileSync(__dirname + '\\..\\..\\src\\schema.json'))