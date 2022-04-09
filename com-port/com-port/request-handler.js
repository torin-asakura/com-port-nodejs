const requestHandler = (request, observer) => async () => {
  if (observer.current) observer.current(undefined)

  const promise = new Promise((resolve) => {
    observer.current = resolve
  })

  request()

  return promise
}

module.exports = { requestHandler }
