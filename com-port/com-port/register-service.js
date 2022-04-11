const { Service } = require('node-windows')

const svc = new Service({
  name: 'Com-port gateway',
  description: 'Com-port gateway',
  script: `C:\\User\\37525\\Desktop\\com-port-nodejs\\com-port\\com-port\\index.js`,
})

svc.on('install', () => {
  svc.start()
})

svc.install()
