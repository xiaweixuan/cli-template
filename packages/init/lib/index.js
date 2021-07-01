'use strict'

class InitCommand {}

function init() {
  return new InitCommand()
}

module.exports = init
module.exports.InitCommand = InitCommand
