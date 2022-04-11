/* eslint-disable no-console */

const createLogger = () => {
  const { createWriteStream } = require('fs')

  const date = Date.now()
  const time = `${date.getFullYear()}-${date.getMonth()}-${date.getHours}h-${date.getMinutes()}m-${
    date.getSeconds
  }s`

  const stream = createWriteStream()

  const write = (payload) => {
    console.log(payload)
    stream.write(`${time}: ${payload}`)
  }

  return { write }
}

module.exports = { createLogger }
