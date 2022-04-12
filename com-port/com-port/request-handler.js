/* eslint-disable no-param-reassign */

const requestHandler = (request, observers, requestType) => async () => {
  const promise = new Promise((resolve) => {
    observers[requestType] = resolve
  })

  request()

  return promise
}

module.exports = { requestHandler }
