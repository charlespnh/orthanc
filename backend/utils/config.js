
const fs = require('fs')

let rawData = fs.readFileSync('env.json', {encoding:'utf8', flag:'r'})
let json = JSON.parse(rawData);

module.exports = json