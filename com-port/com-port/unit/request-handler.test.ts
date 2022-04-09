const { requestHandler } = require('../request-handler')

describe('suit for com-port-nodejs', () => {
  it('should handle request correctly', async () => {
    const observers = []
    const requestedData = 'Requested data'

    const onData = (data) => {
      observers.forEach(observer => observer(data))
    }

    const requestSomething = () => {
      setTimeout(() => {
        onData(requestedData)
      }, 1000)
    }

    const data = await requestHandler(requestSomething, observers)

    expect(data).toBe(requestedData)
  })

  it('should handle multiple requests correctly', async () => {
    const observers = []
    const requestedData1 = 'Requested data 1'
    const requestedData2 = 'Requested data 2'
    const requestedData3 = 'Requested data 3'

    const onData = (data) => {
      observers.forEach(observer => observer(data))
    }

    function* requestGenerator() {
      yield () => setTimeout(() => {
        onData(requestedData1)
      }, 1000)
      yield () => setTimeout(() => {
        onData(requestedData2)
      }, 1000)
      yield () => setTimeout(() => {
        onData(requestedData3)
      }, 1000)
    }

    const requestSomething = requestGenerator()

    const data1 = await requestHandler(requestSomething.next().value, observers)
    const data2 = await requestHandler(requestSomething.next().value, observers)
    const data3 = await requestHandler(requestSomething.next().value, observers)

    expect(data1).toBe(requestedData1)
    expect(data2).toBe(requestedData2)
    expect(data3).toBe(requestedData3)
  })
})
