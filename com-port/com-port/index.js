/* eslint-disable */

'use strict'

const { SerialPort } = require('serialport')
const { DelimiterParser } = require('@serialport/parser-delimiter')
const fastify = require('fastify')

const { requestHandler } = require('./request-handler')
const { createLogger } = require('./logger')

const server = fastify({ logger: true })
const { write } = createLogger()

const doNothing = (...args) => {
  // do nothing
}

const observers = { weight: doNothing, barcode: doNothing }

server.get('/weight', requestHandler(requestWeight, observers, 'weight'))

server.get('/barcode', requestHandler(requestBarcode, observers, 'barcode'))

const port = new SerialPort({
  path: 'COM6',
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
    return write(`% Port open error ${e}`)
  }

  write(`# Port opened OK`)
})

port.on('error', (e) => {
  write(`% Port error: ${e}`)
})

parser.on('data', (data) => {
  write(`# Port data: ${data}`)

  let cmd = data.toString('ascii', 0, 4)
  let payload = Buffer.alloc(data.length - 3)
  data.copy(payload, 0, 3, data.length)

  write(`# Got cmd: ${cmd}`)

  const { weight, barcode } = parseCmd(cmd, payload)

  if (weight && observers.weight) {
    observers.weight(JSON.stringify({ weight }))
  }

  if (barcode && observers.barcode) {
    let payload = JSON.stringify({ barcode }).replaceAll('\\u', '')

    if (payload.search(/0002/) !== 0 && payload.search(/0002/) !== -1) {
      payload = payload.replace(/0002/, '')
    }

    observers.barcode(payload)
  }
})

function parseCmd(cmd, payload) {
  if (cmd.search(/S1/) !== -1 || cmd.search(/S11/) !== -1) {
    let weight = parseInt(payload.toString('ascii'))

    if (cmd.slice(1).replace(/S11/, '') === '') {
      weight = `${weight}`.slice(1)
    }

    write(`# Weight value ${weight}`)

    return { weight }
  }

  if (cmd.search(/S08/) !== -1 || cmd.search(/S8/) !== -1) {
    let barcode = payload.toString('ascii', 1)
    let index = cmd.search(/S08/)

    if (index !== -1) {
      barcode = `${cmd}${barcode}`.slice(index + 3)
    }

    write(`# Got barcode ${barcode}`)

    return { barcode }
  }

  return { barcode: '', weight: '' }
}

function requestWeight() {
  if (port.isOpen) {
    write(`# Requesting weight`)

    port.write(CMD_GETWEIGHT)
    port.write(Buffer.from([EOC, EOC]))
  }
}

function requestBarcode() {
  if (port.isOpen) {
    write(`# Requesting barcode`)

    port.write(CMD_BARCODE)
    port.write(Buffer.from([EOC, EOC]))
  }
}

const start = async () => {
  try {
    await server.listen(3000)
  } catch (err) {
    write(err)
    process.exit(1)
  }
}

start()
