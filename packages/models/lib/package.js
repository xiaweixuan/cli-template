'use strict'

const path = require('path')
const pathExists = require('path-exists')
const fse = require('fs-extra')
const pkgDir = require('pkg-dir').sync
const npminstall = require('npminstall')
const { isObject, formatPath, log, npm } = require('@cli-template/utils')

/*
* 需要动态下载的库文件
*
* **/
class Package {
  constructor(options) {
    log.verbose('options', options)
    if (!options) {
      throw new Error('Package类的参数不能为空')
    }
    if (!isObject(options)) {
      throw new Error('Package类的参数必须为对象')
    }
    // package的所处目录
    this.targetPath = options.targetPath
    // package的存储路径
    this.storePath = options.storePath
    // package的名称
    this.packageName = options.packageName
    // package的版本
    this.packageVersion = options.packageVersion
    // package缓存目录的前缀
    this.npmFilePathPrefix = this.packageName.replace('/', '_')
  }

  get npmFilePath() {
    return path.resolve(this.storePath, `_${this.npmFilePathPrefix}@${this.packageVersion}@${this.packageName}`)
  }

  getSpecificCacheFilePath(packageVersion) {
    return path.resolve(this.storePath, `_${this.npmFilePathPrefix}@${packageVersion}@${this.packageName}`)
  }

  async prepare() {
    /* 检测是否存在缓存目录 */
    if(this.storePath && !await pathExists(this.storePath)){
      fse.mkdirpSync(this.storePath)
    }
    /* 检查版本 */
    if(this.packageVersion === 'latest'){
      this.packageVersion = await npm.getLatestVersion(this.packageName)
    }
  }

  /* 安装package */
  async install() {
    await this.prepare()
    return npminstall({
      root: this.targetPath,
      storeDir: this.storePath,
      registry: npm.getNpmRegistry(),
      pkgs: [{
        name: this.packageName,
        version: this.packageVersion,
      }],
    })
  }

  /* 判断该模块是否存在 */
  async exists() {
    if (this.storePath) {
      await this.prepare()
      return pathExists(this.npmFilePath)
    } else {
      return pathExists(this.targetPath)
    }
  }

  /* 获取package入口文件路径 */
  getRootFilePath() {
    const targetPath = this.storePath ? this.npmFilePath : this.targetPath
    const dir = pkgDir(targetPath)
    if (!dir) return null
    const pkgFile = require(path.resolve(dir, 'package.json'))
    if (!pkgFile || !pkgFile.main) return null
    return formatPath(path.resolve(dir, pkgFile.main))
  }

  async update() {
    const latestVersion = npm.getLatestVersion(this.packageName)
    const latestFilePath = this.getSpecificCacheFilePath(latestVersion)
    if(!await pathExists(latestFilePath)){
      await npminstall({
        root: this.targetPath,
        storeDir: this.storePath,
        registry: npm.getNpmRegistry(),
        pkgs: [{
          name: this.packageName,
          version: latestVersion,
        }],
      })
      this.packageVersion = latestVersion
    }
  }
}

module.exports = Package
