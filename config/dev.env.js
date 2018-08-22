'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')
require('dotenv').config()

const getBaseUrl = () => {
  return process.env.API_BASE_URL
}

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  API_BASE_URL: `"${getBaseUrl()}"`
})
