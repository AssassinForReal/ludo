import Component from '../component/Component.js'

export default class Page extends Component {
  /**
   * @param {string} name 
   * @returns {DocumentFragment}
   */
  component(name) {
    return this.app.template(`component-${name}`)
  }
}
