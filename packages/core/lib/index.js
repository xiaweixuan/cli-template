'use strict'

const { log } = require('@cli-template/utils')
const prepare = require('./prepare')
const registerCommand = require('./registerCommand')

module.exports = cli

async function cli() {
  try {
    /* 检测执行环境 */
    await prepare()
    /* 注册命令 */
    registerCommand()
  } catch (e) {
    log.error(e.message)
  }
}
