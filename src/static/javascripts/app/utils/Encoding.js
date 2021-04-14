export default class Encoding {
  /**
   * @param {string} str 
   * @returns {string}
   */
  static htmlSpecialChars(str) {
    return str.replace(/&/g, '&amp;')
      .replace(/>/g, '&gt;')
      .replace(/</g, '&lt;')
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
  }
}