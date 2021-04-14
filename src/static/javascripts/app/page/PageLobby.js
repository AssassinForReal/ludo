import ComponentChat from '../component/ComponentChat.js'
import Clipboard from '../utils/Clipboard.js'
import Encoding from '../utils/Encoding.js'
import Http from '../utils/Http.js'
import Page from './Page.js'
import PageInGame from './PageInGame.js'
import PageLogin from './PageLogin.js'

export default class PageLobby extends Page {
  /**
   * @param {boolean} lockedIn 
   * @param {object} room 
   */
  constructor(lockedIn, room) {
    super('lobby')
    this.room = room
    this.lockedIn = lockedIn
  }

  onMount() {
    this.playersRef = document.getElementById('lobby-players')
    this.roomLinkRef = document.getElementById('lobby-room-link')
    this.btnCopyLobbyRoomLinkRef = document.getElementById('btn-copy-lobby-room-link')
    this.btnLeaveRef = document.getElementById('btn-lobby-leave')
    this.btnLockInRef = document.getElementById('btn-lobby-lock-in')
    this.chatWrapperRef = document.getElementById('lobby-chat-wrapper')

    this.btnLeaveRef.addEventListener('click', this.handleLeave)
    this.btnLockInRef.addEventListener('click', this.handleLockIn)
    this.btnCopyLobbyRoomLinkRef.addEventListener('click', this.handleLinkCopy)

    this.roomLinkRef.textContent = this.getRoomLink()

    this.componentChat = new ComponentChat('chat', this.pollEvents)
    this.componentChat.init(this.app)
    this.componentChat.rootRef = this.component('chat')
    this.componentChat.mount(this.chatWrapperRef)

    this.pollTask = setInterval(this.pollEvents, 1000)
    this.renderPlayerList(this.room.players)
    this.pollEvents()
  }

  onUnmount() {
    this.btnLeaveRef.removeEventListener('click', this.handleLeave)
    this.btnLockInRef.removeEventListener('click', this.handleLockIn)
    this.btnCopyLobbyRoomLinkRef.removeEventListener('click', this.handleLinkCopy)
    clearInterval(this.pollTask)
  }

  handleLeave = async () => {
    await this.app.sendRequest('quit-room')
    this.app.renderPage(new PageLogin(this.app.username))
  }

  handleLockIn = async () => {
    if (!this.lockedIn) {
      this.lockedIn = true
      this.btnLockInRef.textContent = 'Lock Out'

      await this.app.sendRequest('player-state-change', {
        action: 'lock-in'
      })

      this.pollEvents()
      return
    }

    this.lockedIn = false
    this.btnLockInRef.textContent = 'Lock In'

    await this.app.sendRequest('player-state-change', {
      action: 'lock-out'
    })
  }

  /**
   * @param {object} event 
   */
  onPlayerJoin(event) {
    this.renderPlayerList(event.room.players)
    const username = Encoding.htmlSpecialChars(event.player.username)
    this.componentChat.appendChatMessage(`<span style="color: gold">Player ${username} has joined the game!<span>`)
  }

  /**
   * @param {object} event 
   */
  onPlayerQuit(event) {
    this.renderPlayerList(event.room.players)
    const username = Encoding.htmlSpecialChars(event.player.username)
    this.componentChat.appendChatMessage(`<span style="color: red">Player ${username} left the game!<span>`)
  }

  /**
   * @param {object} event 
   */
  onPlayerStateChange(event) {
    this.renderPlayerList(event.room.players)
  }

  /**
   * @param {Array} players 
   */
  renderPlayerList(players) {
    this.playersRef.innerHTML = ''

    for (const player of players) {
      const playerRef = document.createElement('div')
      const playerNameRef = document.createElement('div')
      const playerStatusRef = document.createElement('div')
      playerRef.className = 'player'
      playerNameRef.textContent = player.username
      playerNameRef.className = 'player-name'
      playerStatusRef.className = 'player-status'
      playerRef.appendChild(playerNameRef)
      playerRef.appendChild(playerStatusRef)

      if (player.ready) {
        playerStatusRef.classList.add('player-ready')
      }

      this.playersRef.appendChild(playerRef)
    }
  }

  handleLinkCopy = () => {
    Clipboard.copy(this.getRoomLink())
    
    this.roomLinkRef.classList.add('animation-bounce')

    const clean = () => {
      this.roomLinkRef.classList.remove('animation-bounce')
      this.roomLinkRef.removeEventListener('animationend', clean)
    }

    this.roomLinkRef.addEventListener('animationend', clean)
  }

  getRoomLink() {
    return `${Http.getDomain()}/join/${this.room.id}`
  }

  /**
   * @param {object} event 
   */
  onGameStart(event) {
    this.app.renderPage(new PageInGame(event.player, event.room, this.componentChat))
  }

  pollEvents = async () => {
    try {
      const res = await this.app.sendRequest('poll-events')
      if (res.result !== 'success') throw res.error
  
      const events = res.events
  
      for (const event of events) {
        switch (event.name) {
          case 'player-join': {
            this.onPlayerJoin(event)
            break
          }
          case 'player-quit': {
            this.onPlayerQuit(event)
            break
          }
          case 'chat-message': {
            this.componentChat.onChatMessage(event)
            break
          }
          case 'player-lock-in':
          case 'player-lock-out': {
            this.onPlayerStateChange(event)
            break
          }
          case 'game-start': {
            this.onGameStart(event)
            break
          }
        }
      }
    } catch (err) {
      location.reload()
    }
  }
}
