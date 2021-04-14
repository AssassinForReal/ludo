import Page from './Page.js'
import PageLobby from './PageLobby.js'

export default class PageLogin extends Page {
  /**
   * @param {string} username 
   */
  constructor(username = undefined) {
    super('login')
    this.username = username
  }

  onMount() {
    this.usernameErrorRef = document.getElementById('username-error')
    this.btnPlayRef = document.getElementById('btn-play')
    this.btnPrivateRoomRef = document.getElementById('btn-private-room')
    
    const usernameRef = document.getElementById('input-username')

    if (!(usernameRef instanceof HTMLInputElement)) {
      throw new Error('Username input has to be an html <input> element!')
    }

    this.usernameRef = usernameRef
    usernameRef.addEventListener('input', this.handleUsernameInput)
    usernameRef.addEventListener('keypress', this.handleUsernameKeyPress)

    this.btnPlayRef.addEventListener('click', this.handlePlayClick)
    this.btnPrivateRoomRef.addEventListener('click', this.handlePrivateRoomClick)

    if (this.username) {
      this.usernameRef.value = this.username
    }
  }

  onUnmount() {
    this.usernameRef.removeEventListener('input', this.handleUsernameInput)
    this.usernameRef.removeEventListener('keypress', this.handleUsernameKeyPress)
    this.btnPlayRef.removeEventListener('click', this.handlePlayClick)
    this.btnPrivateRoomRef.removeEventListener('click', this.handlePrivateRoomClick)
  }

  handleUsernameInput = () => {
    this.usernameRef.value = this.usernameRef.value.substr(0, 16)
  }

  handleUsernameKeyPress = event => {
    if (event.code === 'Enter') {
      this.handlePlayClick()
    }
  }

  handlePlayClick = async () => {
    if (!(await this.login())) return
    const res = await this.app.sendRequest('join-any-room')
    
    if (res.result !== 'success') return
    this.app.renderPage(new PageLobby(false, res.room))
  }

  handlePrivateRoomClick = async () => {
    if (!(await this.login())) return
    const res = await this.app.sendRequest('create-private-room')
    
    if (res.result !== 'success') return
    this.app.renderPage(new PageLobby(false, res.room))
  }

  async login() {
    const username = this.usernameRef.value
    if (!username) return

    const res = await this.app.sendRequest('login', { username })

    if (res.result === 'error') {
      this.usernameErrorRef.textContent = res.message
      this.usernameErrorRef.style.display = 'block'
      return false
    }

    this.app.username = username
    return true
  }
}
