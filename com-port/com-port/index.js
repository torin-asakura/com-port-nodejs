/* eslint-disable */

'use strict'

const { SerialPort } = require('serialport')
const { DelimiterParser } = require('@serialport/parser-delimiter')
const fastify = require('fastify')

const { requestHandler } = require('./request-handler')

const server = fastify({ logger: true })

const observers = []

server.get('/weight', requestHandler(requestWeight, observers))

server.get('/barcode', requestHandler(requestBarcode, observers))

const port = new SerialPort({
  path: 'COM1',
  baudRate: 9600,
  parity: 'none',
  dataBits: 8,
  stopBits: 1,
  rtscts: true,
  autoOpen: false,
})

const CMD_WEIGHT = 'S11'
const CMD_BARCODE = 'S08'
const EOC = 0x0d
const CMD_GETWEIGHT = 'S11'

const parser = port.pipe(
  new DelimiterParser({
    delimiter: [EOC],
    includeDelimiter: false,
  })
)

port.open((e) => {
  if (e) {
    return console.log(`% Port open error ${e}`)
  }

  console.log(`# Port opened OK`)
})

port.on('error', (e) => {
  console.log(`% Port error: ${e}`)
})

parser.on('data', (data) => {
  console.log(`# Port data: ${data}`)

  let cmd = data.toString('ascii', 0, 3)
  let payload = Buffer.alloc(data.length - 3)
  data.copy(payload, 0, 3, data.length)

  console.log(`# Got cmd: ${cmd}`)

  const { weight, barcode } = parseCmd(cmd, payload)

  if (weight) {
    observers.forEach((observer) => observer(JSON.stringify({ weight })))
  }

  if (barcode) {
    observers.forEach((observer) => observer(JSON.stringify({ barcode })))
  }
})

function parseCmd(cmd, payload) {
  switch (cmd) {
    case CMD_WEIGHT:
      let weight = parseInt(payload.toString('ascii'))

      console.log(`# Weight value ${weight}`)

      return { weight }
    case CMD_BARCODE:
      let barcode = payload.toString('ascii', 1)

      console.log(`# Got barcode ${barcode}`)

      return { barcode }
    default:
      return { weight: undefined, barcode: undefined }
  }
}

function requestWeight() {
  if (port.isOpen) {
    console.log(`# Requesting weight`)

    port.write(CMD_GETWEIGHT)
    port.write(Buffer.from([EOC, EOC]))
  }
}

function requestBarcode() {
  if (port.isOpen) {
    console.log(`# Requesting barcode`)

    port.write(CMD_BARCODE)
    port.write(Buffer.from([EOC, EOC]))
  }
}

const start = async () => {
  try {
    await server.listen(3000)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

start()
