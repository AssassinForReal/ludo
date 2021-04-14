class Color {
  static Red = new Color('red', '#cc3232')
  static Blue = new Color('blue', '#1062e9')
  static Green = new Color('green', '#008100')
  static Yellow = new Color('yellow', '#ffff00')

  static Colors = [
    Color.Red, Color.Blue, Color.Green, Color.Yellow
  ]

  /**
   * @param {string} name 
   * @param {string} value 
   */
  constructor(name, value) {
    this.name = name
    this.value = value
  }

  /**
   * @param {string} name 
   * @returns 
   */
  static getColor(name) {
    for (const color of Color.Colors) {
      if (color.name === name) return color
    }
    return null
  }

  static newList() {
    return [...Color.Colors]
  }
}

Object.freeze(Color.Red)
Object.freeze(Color.Blue)
Object.freeze(Color.Green)
Object.freeze(Color.Yellow)
Object.freeze(Color)

module.exports = Color
