import ComponentChat from '../component/ComponentChat.js'
import Encoding from '../utils/Encoding.js'
import VoiceEngine from '../voice/VoiceEngine.js'
import Page from './Page.js'

export default class PageInGame extends Page {
  /**
   * @param {object} player 
   * @param {object} room 
   * @param {ComponentChat} componentChat
   */
  constructor(player, room, componentChat = undefined) {
    super('in-game')
    this.player = player
    this.room = room
    this.componentChat = componentChat
  }

  onMount() {
    this.boardWrapperRef = document.getElementById('board-wrapper')
    this.headingRef = document.getElementById('game-heading')
    this.chatWrapperRef = document.getElementById('chat-wrapper')

    const dicePreviewRef = document.getElementById('dice-preview')
    if (!(dicePreviewRef instanceof HTMLImageElement)) {
      throw new Error('Dice preview has to be an html <img> element!')
    }
    this.dicePreviewRef = dicePreviewRef

    this.btnRollDiceRef = document.getElementById('btn-roll-dice')
    this.timerRef = document.getElementById('timer')

    const canvasRef = document.getElementById('canvas')

    if (!(canvasRef instanceof HTMLCanvasElement)) {
      throw new Error('Canvas has to be an html <canvas> element!')
    }

    this.canvasRef = canvasRef
    this.ctx = canvasRef.getContext('2d')

    if (this.componentChat) {
      this.chatWrapperRef.appendChild(this.componentChat.rootRef)
    } else {
      this.componentChat = new ComponentChat('chat', this.pollEvents)
      this.componentChat.init(this.app)
      // @ts-ignore
      this.componentChat.rootRef = this.component('chat')
      this.componentChat.mount(this.chatWrapperRef)
    }
    
    this.counterRefs = {}
    this.counterVisRef = null
    this.possibleMoves = {}

    this.btnRollDiceRef.addEventListener('click', this.onDiceRoll)

    const board = new Image()
    board.addEventListener('load', () => {
      this.ctx.drawImage(board, 0, 0, board.naturalWidth, board.naturalHeight, 0, 0, this.canvasRef.width, this.canvasRef.height)
    })
    board.src = '/images/board.png'

    this.populatePlayers()
    this.makeCunterVis()

    if (this.room.currentPlayer) {
      this.updateHeading(this.room.currentPlayer, this.room.diceRolled)
    }

    this.pollTask = setInterval(this.pollEvents, 1000)
    this.timerTime = 0
    this.timerTask = null
    this.pollEvents()
  }

  onUnmount() {
    this.btnRollDiceRef.removeEventListener('click', this.onDiceRoll)
    clearInterval(this.pollTask)
    if (this.timerTask) clearInterval(this.timerTask)
  }

  populatePlayers() {
    const holderRefs = document.querySelectorAll('.player-holder')

    for (const player of this.room.players) {
      const color = player.color

      holderRefs.forEach(holderRef => {
        if (!(holderRef instanceof HTMLElement)) return
        if (holderRef.dataset.color === color.name) {
          let username = player.username

          if (player.id == this.player.id) {
            username += ' (You)'
          }

          holderRef.textContent = username
          holderRef.style.color = color.value
        }
      })

      this.populatePlayerCounters(player)
    }
  }

  makeCunterVis() {
    const counterVisRef = document.createElement('div')
    counterVisRef.className = 'counter-vis'
    counterVisRef.style.backgroundColor = this.player.color.value
    counterVisRef.style.opacity = '0.25'
    counterVisRef.style.display = 'none'
    this.boardWrapperRef.appendChild(counterVisRef)
    this.counterVisRef = counterVisRef
  }

  /**
   * @param {object} player 
   */
  populatePlayerCounters(player) {
    for (const { id, position } of player.counters) {
      const counterRef = document.createElement('div')
      counterRef.className = 'counter'
      counterRef.style.left = position.x + 'px'
      counterRef.style.top = position.y + 'px'
      counterRef.style.backgroundColor = player.color.value
      counterRef.dataset.playerId = player.id
      counterRef.dataset.counterId = id
      this.boardWrapperRef.appendChild(counterRef)
      
      if (player.id === this.player.id) {
        this.counterRefs[id] = counterRef

        counterRef.addEventListener('mouseover', () => {
          const move = this.possibleMoves[id]
          if (!move) return
          
          this.counterVisRef.style.left = move.x + 'px'
          this.counterVisRef.style.top = move.y + 'px'
          this.counterVisRef.style.display = 'block'
        })
  
        counterRef.addEventListener('mouseout', () => {
          this.counterVisRef.style.display = 'none'
        })
  
        counterRef.addEventListener('click', () => {
          this.onCounterClick(id)
        })
      }
    }
  }

  /**
   * @param {object} event 
   */
  onPlayerQuit(event) {
    const username = Encoding.htmlSpecialChars(event.player.username)
    this.componentChat.appendChatMessage(`<span style="color: red">Player ${username} left the game!<span>`)
  }

  /**
   * @param {object} event 
   */
  onNextTurn(event) {
    this.updateHeading(event.player, false)
  }

  /**
   * @param {object} event 
   */
  onDiceDrawnNumber(event) {
    const { number } = event
    this.dicePreviewRef.src = `/images/dice/${number}.png`
    this.dicePreviewRef.style.visibility = 'visible'
    VoiceEngine.speak(number)
  }

  onDiceRoll = () => {
    this.btnRollDiceRef.style.display = 'none'
    this.app.sendRequest('roll-dice')
  }

  /**
   * @param {object} currentPlayer 
   * @param {boolean} diceRolled 
   */
  updateHeading(currentPlayer, diceRolled) {
    if (currentPlayer.id !== this.player.id) {
      const username = Encoding.htmlSpecialChars(currentPlayer.username)
      this.headingRef.innerHTML = `<span style="color: ${currentPlayer.color.value}">${username}</span>'s turn`
      this.btnRollDiceRef.style.display = 'none'
      return
    }
    if (!diceRolled) {
      this.btnRollDiceRef.style.display = 'block'
    }
    this.headingRef.innerHTML = `Your turn`
  }

  onPossibleMoves({ moves }) {
    for (const { id, position } of moves) {
      const counterRef = this.counterRefs[id]
      if (!counterRef) continue

      counterRef.classList.add('flashing')

      this.possibleMoves[id] = { ...position }
    }
  }

  async onCounterClick(counterId) {
    const res = await this.app.sendRequest('move-counter', { counterId })
    if (res.result !== 'success') return

    this.possibleMoves = {}

    for (const counterRef of Object.values(this.counterRefs)) {
      counterRef.classList.remove('flashing')
    }
  }

  onCounterMove({ playerId, counterId, position }) {
    // @ts-ignore
    const counterRef = [...document.querySelectorAll(`.counter`)]
      .find(ref => ref.dataset.counterId == counterId && ref.dataset.playerId == playerId)
    if (!counterRef) return
    
    counterRef.style.left = position.x + 'px'
    counterRef.style.top = position.y + 'px'
  }

  onGameEnd({ player }) {
    if (player) {
      const username = Encoding.htmlSpecialChars(player.username)
      this.headingRef.innerHTML = `<span style="color: ${player.color.value}">${username}</span> <span style="color: gold">has won the game!</span>`
    }
    if (this.timerTask) clearInterval(this.timerTask)
    this.timerRef.textContent = '🏆'
  }

  updateTimer = () => {
    this.timerRef.textContent = this.timerTime.toString()
    this.timerTime = Math.max(this.timerTime - 1, 0)
  }

  pollEvents = async () => {
    try {
      const res = await this.app.sendRequest('poll-events')
      if (res.result !== 'success') throw res.error

      const events = res.events

      for (const event of events) {
        switch (event.name) {
          case 'player-quit': {
            this.onPlayerQuit(event)
            break
          }
          case 'chat-message': {
            this.componentChat.onChatMessage(event)
            break
          }
          case 'next-turn': {
            this.onNextTurn(event)
            break
          }
          case 'dice-drawn-number': {
            this.onDiceDrawnNumber(event)
            break
          }
          case 'possible-moves': {
            this.onPossibleMoves(event)
            break
          }
          case 'counter-move': {
            this.onCounterMove(event)
            break
          }
          case 'game-end': {
            this.onGameEnd(event)
            break
          }
          case 'start-timer': {
            if (this.timerTask) clearInterval(this.timerTask)
            this.timerTime = event.time
            this.timerTask = setInterval(this.updateTimer, 1000)
            this.updateTimer()
          }
        }
      }
    } catch (err) {
      location.reload()
    }
  }
}
