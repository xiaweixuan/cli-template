'use strict'

const path = require('path')

function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]'
}

function formatPath(p) {
  /* 路径兼容Win/Mac */
  const sep = path.sep
  if (sep === '/') {
    return p
  } else {
    return p.replace(/\\/g, '/')
  }
}


module.exports = {
  isObject,
  formatPath
}
