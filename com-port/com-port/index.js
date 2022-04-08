'use strict'

const { SerialPort } = require('serialport')
const { DelimiterParser } = require('@serialport/parser-delimiter')
const fastify = require('fastify')

const server = fastify({ logger: true })

let ready = false
let data

const applyResult = (result) => {
	data = result
	ready = true
}

const reset = () => {
	data = undefined
	ready = false
}

server.get('/weight', async (req, res) => {
	requestWeight()

	while(!ready) {
		// do nothing
	}

	reset()

	return { weight: data }
})

const port = new SerialPort({
	path: 'COM1',
	baudRate: 9600,
	parity: 'none',
	dataBits: 8,
	stopBits: 1,
	rtscts: true,
	autoOpen: false
});

const CMD_WEIGHT = "S11";
const CMD_BARCODE = "S08";
const EOC = 0x0D;
const CMD_GETWEIGHT = "S11";

const parser = port.pipe(new DelimiterParser({
	delimiter: [EOC],
	includeDelimiter: false
}));

port.open((e) => {
	if (e) {
		return console.log(`% Port open error ${e}`);
	}

	console.log(`# Port opened OK`);
});

port.on('error', (e) => {
	console.log(`% Port error: ${e}`);
});

parser.on('data', (data) => {
	console.log(`# Port data: ${data}`);

	let cmd = data.toString('ascii', 0, 3);
	let payload = Buffer.alloc(data.length - 3);
	data.copy(payload, 0, 3, data.length);

	console.log(`# Got cmd: ${cmd}`);

	const { weight } = parseCmd(cmd, payload);

	applyResult(weight)
});

function parseCmd(cmd, payload) {
	switch (cmd) {
		case CMD_WEIGHT:
			let weight = parseInt(payload.toString('ascii'));

			console.log(`# Weight value ${weight}`);

			return { weight }
		case CMD_BARCODE:
			let barcode = payload.toString('ascii', 1);

			console.log(`# Got barcode ${barcode}`);

			return { barcode }
		default:
			return { weight: undefined, barcode: undefined }
	}
}

function requestWeight() {
	if (port.isOpen) {
		console.log(`# Requesting weight`);

		port.write(CMD_GETWEIGHT);
		port.write(Buffer.from([EOC, EOC]));
	}
}

const start = async () => {
	try {
		await fastify.listen(3000)
	} catch (err) {
		console.log(err)
		fastify.log.error(err)
		process.exit(1)
	}
}

start()
