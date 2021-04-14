import Page from './page/Page.js'
import PageInGame from './page/PageInGame.js'
import PageLobby from './page/PageLobby.js'
import PageLogin from './page/PageLogin.js'
import VoiceEngine from './voice/VoiceEngine.js'

export default class Application {
  constructor() {
    this.rootRef = document.getElementById('app-root')

    /**
     * @type {Page}
     */
    this.currentPage = null
    this.username = ''
  
    VoiceEngine.create()
  }

  async start() {
    const status = await this.sendRequest('status')
    const { player, room } = status

    if (!player) {
      return this.renderPage(new PageLogin())
    } else {
      this.username = player.username
      
      if (!room) {
        return this.renderPage(new PageLogin(player.username))
      }

      if (room.state === 'waiting' || room.state === 'countdown') {
        return this.renderPage(new PageLobby(player.ready, room))
      } else {
        return this.renderPage(new PageInGame(player, room))
      }
    }
  }

  /**
   * @param {Page} page 
   */
  renderPage(page) {
    const fragment = this.template(`page-${page.name}`)

    if (this.currentPage) {
      this.currentPage.onUnmount()
    }

    this.rootRef.innerHTML = ''
    this.rootRef.appendChild(fragment)

    this.currentPage = page
    this.currentPage.init(this)
    this.currentPage.onMount()
  }

  /**
   * @param {string} name 
   * @returns {DocumentFragment}
   */
  template(name) {
    const template = document.getElementById(name)

    if (!template || !(template instanceof HTMLTemplateElement)) {
      throw new Error(`Missing template: ${name}`)
    }

    const fragment = template.content.cloneNode(true)

    if (!(fragment instanceof DocumentFragment)) {
      throw new Error(`Template should have one root element: ${name}`)
    }

    return fragment
  }

  /**
   * @param {string} name 
   * @param {object} body 
   */
  async sendRequest(name, body = undefined) {
    const method = body === undefined ? 'get' : 'post'
    const bodyJson = body === undefined ? undefined : JSON.stringify(body)

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: bodyJson
    }

    const res = await fetch(`/api/${name}`, options)
    const data = await res.json()
    return data
  }
}
