'use strict'

const { log } = require('@cli-template/utils')

/* 使所有命令继承与该类，例如init，add */
class Command {
  constructor(argv) {
    this._argv = argv
    let runner = new Promise((res,rej) => {
      let chain = new Promise.resolve()
      chain = chain.then(() => {}) // 检查node版本
      chain = chain.then(() => {}) // 解析参数
      chain = chain.then(() => this.init())
      chain = chain.then(() => this.exec())
      chain.catch(err => log.error(err))
    })
  }

  init() {
    throw new Error('init方法必须实现')
  }

  exec(){
    throw new Error('exec方法必须实现')
  }
}

module.exports = Command
