const Player = require('./player')
const Color = require('./color')
const RoomState = require('./room-state')
const Random = require('./random')
const positions = require('./positions')
const Encoding = require('./encoding')

class Room {
  /**
   * @param {string} id 
   */
  constructor(id) {
    this.id = id

    /**
     * @type {Player[]}
     */
    this.players = []

    /**
     * @type {number}
     */
    this.state = RoomState.Waiting
    this.slots = 4
    this.private = false

    /**
     * @type {Player}
     */
    this.currentPlayer = null
    this.currentPlayerColorIndex = 0

    this.diceRolled = false
    this.diceNumber = 0

    this.roundTime = 0
    this.roundTimerTask = null
  }

  /**
   * @param {Player} player 
   */
  addPlayer(player) {
    this.players.push(player)
  }

  /**
   * @param {Player} player 
   */
  removePlayer(player) {
    const index = this.players.indexOf(player)
    if (index != -1) {
      this.players.splice(index, 1)
    }
  }

  /**
   * @param {object} event 
   * @param {Player} playerToIgnore 
   */
  dispatchEvent(event, playerToIgnore = undefined) {
    for (const player of this.players) {
      if (player !== playerToIgnore) {
        player.queueEvent({ player: player.toNetworkObject(), ...event })
      }
    }
  }

  /**
   * @param {string} message 
   */
  broadcastMessage(message) {
    this.dispatchEvent({ name: 'chat-message', message })
  }

  startGame() {
    this.state = RoomState.Ingame

    const colors = Color.newList()

    this.players.forEach(player => {
      player.color = colors.splice(Random.randomInt(0, colors.length - 1), 1)[0]
      player.counters = []

      const basePositions = positions[player.color.name].base

      for (let i = 0; i < basePositions.length; i++) {
        player.counters.push({
          id: i,
          index: i,
          position: basePositions[i],
          area: 'base'
        })
      }
    })

    this.dispatchEvent({
      name: 'game-start',
      room: this.toNetworkObject()
    })

    setTimeout(() => {
      this.firstMove()
    }, 1000)
  }

  firstMove() {
    for (let colorIndex = 0; colorIndex < Color.Colors.length; colorIndex++) {
      const player = this.getPlayerByColorIndex(colorIndex)
      if (!player) continue

      this.currentPlayerColorIndex = colorIndex
      this.currentPlayer = player
      break
    }

    this.setupTimer()
    this.announceCurrentMove()
  }

  nextMove() {
    for (let i = 0; i < Color.Colors.length; i++) {
      const colorIndex = (this.currentPlayerColorIndex + i + 1) % Color.Colors.length

      const player = this.getPlayerByColorIndex(colorIndex)
      if (!player || player.finished) continue

      this.currentPlayerColorIndex = colorIndex
      this.currentPlayer = player
      break
    }

    this.diceRolled = false
    this.setupTimer()
    this.announceCurrentMove()
  }

  setupTimer() {
    if (this.roundTimerTask) clearInterval(this.roundTimerTask)
    this.roundTime = 30
    this.roundTimerTask = setInterval(this.updateTimer, 1000)
  }

  updateTimer = () => {
    if (this.roundTime === 0) {
      this.nextMove()
      return
    }

    this.roundTime--
  }

  announceCurrentMove() {
    this.dispatchEvent({
      name: 'next-turn',
      player: this.currentPlayer.toNetworkObject(),
      colorIndex: this.currentPlayerColorIndex
    })
    this.dispatchEvent({
      name: 'start-timer',
      time: this.roundTime
    })
  }

  rollDice(debug = 0) {
    const number = debug ? debug : Random.randomInt(1, 6)
    this.dispatchEvent({
      name: 'dice-drawn-number',
      number
    })

    this.diceNumber = number
    this.diceRolled = true

    const moves = this.getPossibleMoves()

    if (moves.length === 0) {
      this.nextMove()
      return
    }

    this.currentPlayer.queueEvent({
      name: 'possible-moves',
      moves
    })
  }

  moveCounter(counterId) {
    const moves = this.getPossibleMoves()
    const move = moves.find(m => m.id === counterId)
    if (!move) return false

    const counter = this.currentPlayer.counters.find(c => c.id === counterId)
    if (!counter) return false

    counter.position = move.position
    counter.index = move.index
    counter.area = move.area

    this.dispatchEvent({
      name: 'counter-move',
      playerId: this.currentPlayer.id,
      counterId,
      position: counter.position
    })

    for (const otherPlayer of this.players) {
      if (otherPlayer.id === this.currentPlayer.id) continue

      for (const otherCounter of otherPlayer.counters) {
        if (otherCounter.area !== 'field') continue
        if (otherCounter.index !== move.index) continue

        otherCounter.area = 'base'
        otherCounter.index = otherCounter.id

        const pos = positions[otherPlayer.color.name].base[otherCounter.index]
        otherCounter.position.x = pos.x
        otherCounter.position.y = pos.y

        this.dispatchEvent({
          name: 'counter-move',
          playerId: otherPlayer.id,
          counterId: otherCounter.id,
          position: otherCounter.position
        })
      }
    }

    const hasWon = this.currentPlayer.counters.every(counter => counter.area === 'finish')

    if (!hasWon) {
      this.nextMove()
      return true
    }

    this.endGame(this.currentPlayer)
    return true
  }

  endGame(winner = null) {
    this.state = RoomState.Ended

    if (this.roundTimerTask) clearInterval(this.roundTimerTask)

    if (winner) {
      winner.finished = true

      const encUsername = Encoding.htmlSpecialChars(winner.username)
      const color = winner.color ? winner.color.value : '#777'

      this.broadcastMessage(`<span style="color: ${color}">${encUsername}</span> <span style="color: gold">has won the game!</span>`)
    }

    this.dispatchEvent({
      name: 'game-end',
      player: winner ? winner.toNetworkObject() : undefined
    })
  }

  getPossibleMoves() {
    const player = this.currentPlayer
    if (!player) return []

    const color = player.color.name
    const number = this.diceNumber
    const startIndex = positions[color].startIndex
    const moves = []

    for (const counter of player.counters) {
      if (counter.area === 'base') {
        if (number === 1 || number === 6) {
          const index = startIndex
          moves.push({
            id: counter.id,
            index,
            position: {
              x: positions.positions[index].x,
              y: positions.positions[index].y,
            },
            area: 'field'
          })
        }
      }
      else if (counter.area === 'field') {
        const index = (counter.index + number) % 40
        const endIndex = (startIndex + 39) % 40

        let passedThroughEnd = false
        let overpassed = false

        if (index > counter.index) {
          if (index > endIndex && endIndex >= counter.index) passedThroughEnd = true
        } else {
          if (endIndex >= counter.index || endIndex < index) passedThroughEnd = true
          overpassed = true
        }

        if (!passedThroughEnd) {
          moves.push({
            id: counter.id,
            index,
            position: {
              x: positions.positions[index].x,
              y: positions.positions[index].y,
            },
            area: 'field'
          })

          continue
        }

        let finishIndex = 0

        if (overpassed) {
          finishIndex = index + 39 - endIndex
        } else {
          finishIndex = index - endIndex - 1
        }

        if (finishIndex > 3) continue

        let canMove = true

        for (const counter of player.counters) {
          if (counter.area === 'finish') {
            if (counter.index == finishIndex) {
              canMove = false
              break
            }
          }
        }

        if (canMove) {
          moves.push({
            id: counter.id,
            index: finishIndex,
            position: {
              x: positions[color].finish[finishIndex].x,
              y: positions[color].finish[finishIndex].y,
            },
            area: 'finish'
          })
        }
      }
    }

    return moves
  }

  getPlayerByColorIndex(colorIndex) {
    const color = Color.Colors[colorIndex]

    return this.players.find(player => {
      return player.color.name === color.name
    })
  }

  getPlayerById(playerId) {
    return this.players.find(player => {
      return player.id === playerId
    })
  }

  /**
   * @returns {boolean}
   */
  isFull() {
    return this.players.length >= this.slots
  }

  /**
   * @returns {boolean}
   */
  canJoin() {
    if (this.isFull()) return false
    if (!this.isWaiting() && !this.isCountingDown()) return false
    return true
  }

  /**
   * @returns {boolean}
   */
  isWaiting() {
    return this.state === RoomState.Waiting
  }

  /**
   * @returns {boolean}
   */
  isCountingDown() {
    return this.state === RoomState.Countdown
  }

  /**
   * @returns {boolean}
   */
  isInGame() {
    return this.state === RoomState.Ingame
  }

  /**
   * @returns {boolean}
   */
  hasEnded() {
    return this.state === RoomState.Ended
  }

  /**
   * @returns {object}
   */
  toNetworkObject() {
    const obj = {
      id: this.id,
      state: this.state,
      currentPlayerColorIndex: this.currentPlayerColorIndex,
      diceRolled: this.diceRolled,
      diceNumber: this.diceNumber,
      roundTime: this.roundTime,
      players: []
    }

    if (this.currentPlayer) {
      obj.currentPlayer = this.currentPlayer.toNetworkObject()
    }

    for (const player of this.players) {
      obj.players.push(player.toNetworkObject())
    }

    return obj
  }
}

module.exports = Room
