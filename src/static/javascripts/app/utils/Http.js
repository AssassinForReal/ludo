export default class Http {
  static getDomain() {
    let port = location.port

    if (port) {
      port = `:${port}`
    }

    return `${location.protocol}//${location.hostname}${port}`
  }
}
