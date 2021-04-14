class Random {
  /**
   * @param {number} min 
   * @param {number} max 
   * @returns {number}
   */
  static randomFloat(min, max) {
    return Math.random() * (max - min) + min
  }

  /**
   * @param {number} min 
   * @param {number} max 
   * @returns {number}
   */
  static randomInt(min, max) {
    return Math.floor(Random.randomFloat(min, max + 1))
  }

  /**
   * @param {number} chance 
   * @returns {boolean}
   */
  static chanceOf(chance) {
    return Random.randomInt(0, 100) <= chance
  }
}

module.exports = Random
