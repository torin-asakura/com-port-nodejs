/* eslint-disable no-console */

const createLogger = () => {
  const { createWriteStream } = require('fs')

  const date = new Date()
  const time = `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getHours()}h-${date.getMinutes()}m-${date.getSeconds()}s`

  const stream = createWriteStream('./com-port.log')

  const write = (payload) => {
    console.log(payload)
    stream.write(`${time}: ${payload}`)
  }

  return { write }
}

module.exports = { createLogger }
