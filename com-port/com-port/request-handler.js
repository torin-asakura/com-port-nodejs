const requestHandler = async (request, observers) => {
  request()

  return new Promise((resolve) => {
    observers.push((value) => {
      observers.pop()
      resolve(value)
    })
  })
}

module.exports = { requestHandler }
