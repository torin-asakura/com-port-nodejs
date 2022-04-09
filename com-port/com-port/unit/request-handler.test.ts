const { requestHandler } = require('../request-handler')

describe('suit for com-port-nodejs', () => {
  it('should handle request correctly', async () => {
    const observer = { current: (data) => {} }
    const requestedData = 'Requested data'

    const onData = (data) => {
      if (observer.current) {
        observer.current(data)
      }
    }

    const requestSomething = () => {
      setTimeout(() => {
        onData(requestedData)
      }, 1000)
    }

    const request = requestHandler(requestSomething, observer)
    const result = await request()

    expect(result).toBe(requestedData)
  })

  it('should handle multiple requests sync', async () => {
    const observer = { current: (data) => {} }
    const requestedData1 = 'Requested data 1'
    const requestedData2 = 'Requested data 2'
    const requestedData3 = 'Requested data 3'

    const onData = (data) => {
      if (observer.current) {
        observer.current(data)
      }
    }

    function* requestGenerator() {
      yield () =>
        setTimeout(() => {
          onData(requestedData1)
        }, 1000)
      yield () =>
        setTimeout(() => {
          onData(requestedData2)
        }, 1000)
      yield () =>
        setTimeout(() => {
          onData(requestedData3)
        }, 1000)
    }

    const requestSomething = requestGenerator()

    const request1 = requestHandler(requestSomething.next().value, observer)
    const request2 = requestHandler(requestSomething.next().value, observer)
    const request3 = requestHandler(requestSomething.next().value, observer)

    const result1 = await request1()
    const result2 = await request2()
    const result3 = await request3()

    expect(result1).toBe(requestedData1)
    expect(result2).toBe(requestedData2)
    expect(result3).toBe(requestedData3)
  })

  it('should handle multiple requests at a time', async () => {
    const observer = { current: (data) => {} }
    const requestedData = 'Requested data'

    const onData = (data) => {
      if (observer.current) {
        observer.current(data)
      }
    }

    requestHandler(() => onData('Should fail'), observer)()
    requestHandler(() => onData('Should fail'), observer)()

    const request = requestHandler(() => onData(requestedData), observer)
    const result = await request()

    expect(result).toBe(requestedData)
  })
})
