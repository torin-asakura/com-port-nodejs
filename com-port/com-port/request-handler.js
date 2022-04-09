/* eslint-disable no-param-reassign */

const requestHandler = (request, observer, requestType) => async () => {
  if (observer.current) observer.current(undefined)

  observer.type = requestType

  const promise = new Promise((resolve) => {
    observer.current = resolve
  })

  request()

  return promise
}

module.exports = { requestHandler }
