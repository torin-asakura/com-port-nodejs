const { requestHandler } = require('../request-handler')

describe('suit for com-port-nodejs', () => {
  const doNothing = (...args) => {
    // do nothing
  }

  it('should handle request correctly', async () => {
    const observer = { weight: doNothing }
    const requestedData = 'Requested data'

    const onWeight = (data) => {
      if (observer.weight) {
        observer.weight(data)
      }
    }

    const requestSomething = () => {
      setTimeout(() => {
        onWeight(requestedData)
      }, 1000)
    }

    const request = requestHandler(requestSomething, observer, 'weight')
    const result = await request()

    expect(result).toBe(requestedData)
  })

  it('should handle multiple requests sync', async () => {
    const observer = { weight: doNothing }
    const requestedData1 = 'Requested data 1'
    const requestedData2 = 'Requested data 2'
    const requestedData3 = 'Requested data 3'

    const onWeight = (data) => {
      if (observer.weight) {
        observer.weight(data)
      }
    }

    function* requestGenerator() {
      yield () =>
        setTimeout(() => {
          onWeight(requestedData1)
        }, 1000)
      yield () =>
        setTimeout(() => {
          onWeight(requestedData2)
        }, 1000)
      yield () =>
        setTimeout(() => {
          onWeight(requestedData3)
        }, 1000)
    }

    const requestSomething = requestGenerator()

    const request1 = requestHandler(requestSomething.next().value, observer, 'weight')
    const request2 = requestHandler(requestSomething.next().value, observer, 'weight')
    const request3 = requestHandler(requestSomething.next().value, observer, 'weight')

    const result1 = await request1()
    const result2 = await request2()
    const result3 = await request3()

    expect(result1).toBe(requestedData1)
    expect(result2).toBe(requestedData2)
    expect(result3).toBe(requestedData3)
  })

  it('should handle multiple requests at a time', async () => {
    const observers = {
      weight: doNothing,
      barcode: doNothing,
    }
    const requestedWeight = '100'
    const requestedBarcode = '123345'

    const onWeight = (data) => {
      if (observers.weight) {
        observers.weight(data)
      }
    }
    const onBarcode = (data) => {
      if (observers.barcode) {
        observers.barcode(data)
      }
    }

    const requestWeight = requestHandler(
      () => {
        setTimeout(() => {
          onWeight(requestedWeight)
        }, 1000)
      },
      observers,
      'weight'
    )
    const requestBarcode = requestHandler(
      () => {
        setTimeout(() => {
          onBarcode(requestedBarcode)
        }, 1000)
      },
      observers,
      'barcode'
    )

    const weightPromise = requestWeight()
    const barcodePromise = requestBarcode()

    const weight = await weightPromise
    const barcode = await barcodePromise

    expect(weight).toBe(requestedWeight)
    expect(barcode).toBe(requestedBarcode)
  })
})
