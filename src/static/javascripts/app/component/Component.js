import Application from '../Application.js'

export default class Component {
  /**
   * @param {string} name 
   */
  constructor(name) {
    this.name = name

    /**
     * @type {Application}
     */
    this.app = null
  }

  /**
   * @param {Application} app 
   */
  init(app) {
    if (!this.app) {
      this.app = app
    }
  }

  onMount() { }
  onUnmount() { }
}
