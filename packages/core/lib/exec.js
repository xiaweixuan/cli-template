'use strict'

const path = require('path')
const cp = require('child_process')
const { log } = require('@cli-template/utils')
const { Package } = require('@cli-template/models')
const { DEPENDENCIES_PATH } = require('./const')

const SETTINGS = {
  // init: '@cli-template/init' 由于未发布，所以无法在npm中监测到此方法
  init: 'axios',
  add: 'axios'
}

async function exec() {
  const program = arguments[arguments.length - 1]

  const homePath = process.env.CLI_HOME_PATH
  const targetPath = process.env.CLI_TARGET_PATH
  let pkg

  const packageName = SETTINGS[program.name()] // 要执行的包名
  const packageVersion = 'latest' // 要执行包的版本

  if (!targetPath) {
    pkg = new Package({
      targetPath: path.resolve(homePath, DEPENDENCIES_PATH),
      storePath: path.resolve(homePath, DEPENDENCIES_PATH, 'node_modules'),
      packageName,
      packageVersion
    })

    if (await pkg.exists()) {
      await pkg.update()
    } else {
      await pkg.install()
    }
  } else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion
    })
  }
  const rootFile = pkg.getRootFilePath()
  if (!rootFile) return
  try {
    const args = Array.from(arguments)
    const cmd = args[args.length - 1]
    const o = Object.create(null)
    Object.keys(cmd).forEach(key => {
      if(
        cmd.hasOwnProperty(key) &&
        !key.startsWith('_') &&
        key !== 'parent'
      ) o[key] = cmd[key]
    })
    args[args.length - 1] = o
    const code = `require('${rootFile}').call(null, ${JSON.stringify(args)})`
    const child = spawn('node', ['-e', code], {
      cwd: process.cwd(),
      stdio: 'inherit'
    })
    child.on('error', e => {
      log.error(e.message)
      process.exit(1)
    })
    child.on('exit', e => {
      log.verbose('命令执行成功' + e)
      process.exit(e)
    })
  } catch (err) {
    log.error(err.message)
  }
}

/* 自定义命令执行方法来兼容win与mac系统 */
function spawn(command, args, options) {
  const win32 = process.platform === 'win32'
  const cmd = win32 ? 'cmd' : command
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args
  return cp.spawn(cmd, cmdArgs, options || {})
}

module.exports = exec
