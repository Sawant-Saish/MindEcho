const path = require('node:path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const config = {
  mongodb: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/lector',
    options: {},
  },
  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.js',
  useFileHash: false,
  moduleSystem: 'commonjs',
}

module.exports = config
