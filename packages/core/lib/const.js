'use strict'

module.exports = {
  LOWEST_NODE_VERSION: '11.0.0',
  DEFAULT_CLI_HOME: '.cli-template',
  NPM_NAME: '@cli-template/core',
  DEPENDENCIES_PATH: 'dependencies',
}

/**
 * 环境变量下的信息：
 * LOG_LEVEL 输出模式
 * CLI_TARGET_PATH 执行文件路径 自定义的路径
 * CLI_HOME_PATH 缓存文件路径 /uer/dancer/.cli-template
 * */

// homePath 缓存文件路径
// targetPath 执行文件路径,手动指定要去执行的文件
// storePath 包（init、add）的存储路径
// rootFile 要执行的动作文件（init、add包）的未知

