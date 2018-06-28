const glob = require('glob')
const path = require('path')

const specFiles = glob.sync('*.spec.js', {
  cwd: path.resolve(__dirname), matchBase: true, ignore: ['helpers/**']
})

specFiles.map(file => require(`./${file}`))
