'use strict'

const fs = require('fs')
const path = require('path')
const fse = require('fs-extra')
const commander = require('commander')
const { log } = require('@cli-template/utils')
const exec = require('./exec')
const packageConfig = require('../package')
const {
  DEPENDENCIES_PATH,
} = require('./const')

module.exports = registerCommand

const program = new commander.Command()

function registerCommand() {
  program
  .version(packageConfig.version)
  .usage('<command> [options]')
  .option('-d, --debug', '是否开启调试模式', false)
  .option('-tp, --targetPath <packagePath>', '是否指定本地调试文件路径', '')

  program
  .command('init [type]')
  .description('项目初始化')
  .option('--force', '覆盖当前路径文件（谨慎使用）')
  .action(() => log.notice('暂不支持init命令'))

  program
  .command('add [type]')
  .description('项目初始化')
  .option('--force', '覆盖当前路径文件（谨慎使用）')
  .action(exec)

  program
  .command('clean')
  .description('清空缓存文件')
  .option('-a, --all', '清空全部')
  .option('-d, --dep', '清空依赖文件')
  .action((options) => {
    const { CLI_HOME_PATH } = process.env
    log.notice('开始清空缓存文件')
    if (options.all) {
      cleanDir(CLI_HOME_PATH)
    } else if (options.dep) {
      const depPath = path.resolve(CLI_HOME_PATH, DEPENDENCIES_PATH)
      cleanDir(depPath)
    } else {
      cleanDir(CLI_HOME_PATH)
    }
  })

  /* 指定执行文件路径 */
  program.on('option:targetPath', function (path) {
    process.env.CLI_TARGET_PATH = path
    log.verbose(`执行文件路径：${path}`)
  })

  /* 对未知命令监测 */
  program.on('command:*', function (obj) {
    log.warn(`未知命令 ${obj.join(' ')}，请参照以下方式输入: `)
    program.outputHelp()
  })

  if(program.args && program.args.length < 1) {
    program.outputHelp()
  }

  program.
    parse(process.argv)

}

function cleanDir(path) {
  if (fs.existsSync(path)) {
    fse.emptyDirSync(path)
    log.success('清空全部缓存文件成功')
    log.verbose(`文件目录为 ${path}`)
  } else {
    log.success('文件夹不存在', path)
  }
}
