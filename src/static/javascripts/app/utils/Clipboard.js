export default class Clipboard {
  /**
   * @param {string} text 
   */
  static copy(text) {
    const tempRef = document.createElement('input')
    tempRef.value = text
    document.body.appendChild(tempRef)
    tempRef.select()
    document.execCommand('copy')
    document.body.removeChild(tempRef)
  }
}
