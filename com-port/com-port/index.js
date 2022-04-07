/* eslint-disable */

import SerialPort from 'serialport'
import DelimiterParser from '@serialport/parser-delimiter'

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

port.on('open', () => {
	requestWeight();
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

  parseCmd(cmd, payload);
});

function parseCmd(cmd, payload) {
	switch (cmd) {
		case CMD_WEIGHT:
			let weight = parseInt(payload.toString('ascii'));

			console.log(`# Weight value ${weight}`);

			break;
		case CMD_BARCODE:
			let barcode = payload.toString('ascii', 1);
			
			console.log(`# Got barcode ${barcode}`);

			break;
	}
}

function requestWeight() {
	if (port.isOpen) {
		console.log(`# Requesting weight`);

		port.write(CMD_GETWEIGHT);
		port.write(Buffer.from([EOC, EOC]));
	}

	setTimeout(requestWeight, 1000);
}
