'use strict'

const fs = require('fs')
const path = require('path')
const colors = require('colors/safe')
const userHome = require('user-home')
const semver = require('semver')
const { log, npm } = require('@cli-template/utils')
const packageConfig = require('../package')
const {
  LOWEST_NODE_VERSION,
  DEFAULT_CLI_HOME,
  NPM_NAME,
} = require('./const')

module.exports = prepare

async function prepare() {
  /* 检查当前运行版本 */
  checkPkgVersion()
  /* 检查 node 版本 */
  checkNodeVersion()
  /* 检查参数 */
  checkInputArgs()
  /* 检查是否为 root 启动 */
  checkRoot()
  /* 检查用户主目录 */
  checkUserHome()
  /* 检查环境变量 */
  checkEnv()
  /* 检查工具是否需要更新 */
  // await checkGlobalUpdate()
}

function checkPkgVersion() {
  log.info('cli', packageConfig.version)
}

function checkNodeVersion() {
  log.info('node', process.version)
  if (!semver.gte(process.version, LOWEST_NODE_VERSION)) {
    throw new Error(colors.red(`请安装 v${LOWEST_NODE_VERSION} 以上版本的 Node.js`))
  }
}

function checkInputArgs() {
  log.verbose('开始校验输入参数');
  const minimist = require('minimist');
  const args = minimist(process.argv.slice(2)); // 解析查询参数
  checkArgs(args); // 校验参数
  log.verbose('输入参数', args);
}

function checkArgs(args) {
  process.env.LOG_LEVEL = args.debug || args.d ? 'verbose' : 'info'
  log.level = args.debug || args.d ? 'verbose' : 'info'
}

function checkRoot() {
  const rootCheck = require('root-check')
  rootCheck(colors.red('请避免使用 root 账户启动本应用'))
}

function checkUserHome() {
  if (!userHome || !fs.existsSync(userHome)) {
    throw new Error(colors.red('当前登录用户主目录不存在！'))
  }
}

function checkEnv() {
  log.verbose('开始检查环境变量')
  const dotenv = require('dotenv')
  dotenv.config({
    path: path.resolve(userHome, '.env'),
  })
  const config = createDefaultConfig()
  log.verbose('环境变量', config);
}

function createDefaultConfig() {
  process.env.CLI_HOME_PATH = process.env.CLI_HOME ?
    path.join(userHome, process.env.CLI_HOME) :
    path.join(userHome, DEFAULT_CLI_HOME)
  return process.env
}

async function checkGlobalUpdate() {
  log.verbose('检查 cli-template 最新版本')
  const currentVersion = packageConfig.version
  const lastVersion = await npm.getNpmLatestSemverVersion(NPM_NAME, currentVersion)
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(colors.yellow(`请手动更新 ${NPM_NAME}，当前版本：${packageConfig.version}，最新版本：${lastVersion}
                更新命令： npm install -g ${NPM_NAME}`))
  }
}
