const crypto = require('crypto')
const Player = require('./player')
const Room = require('./room')

class Server {
  constructor() {
    /**
     * @type {Player[]}
     */
    this.players = []

    /**
     * @type {Room[]}
     */
    this.rooms = []
  }

  /**
   * 
   * @param {string} id 
   * @returns {Player}
   */
  getPlayerById(id) {
    if (!id) return null
    return this.players.find(player => player.id === id)
  }
  
  /**
   * 
   * @param {string} secretId 
   * @returns {Player}
   */
  getPlayerBySecretId(secretId) {
    if (!secretId) return null
    return this.players.find(player => player.secretId === secretId)
  }

  /**
   * @param {Player} player 
   */
  addPlayer(player) {
    this.players.push(player)
  }

  /**
   * @returns {Player}
   */
  newPlayer() {
    while (true) {
      const secretBytes = crypto.randomBytes(128)
      const playerSecretId = secretBytes.toString('base64')
      if (this.getPlayerBySecretId(playerSecretId)) continue

      const bytes = crypto.randomBytes(8)
      const playerId = bytes.toString('hex')
      if (this.getPlayerById(playerId)) continue

      const player = new Player(playerId, playerSecretId)
      this.addPlayer(player)
      return player
    }
  }

  /**
   * 
   * @param {string} id 
   * @returns {Room}
   */
  getRoomById(id) {
    if (!id) return null
    return this.rooms.find(room => room.id === id)
  }

  /**
   * @param {Room} room 
   */
  addRoom(room) {
    this.rooms.push(room)
  }

  /**
   * @returns {Room}
   */
  newRoom() {
    while (true) {
      const bytes = crypto.randomBytes(8)
      const roomId = bytes.toString('hex')
      if (this.getRoomById(roomId)) continue

      const room = new Room(roomId)
      this.addRoom(room)
      return room
    }
  }

  /**
   * @param {Room} room 
   * @param {Player} player 
   */
  joinRoom(room, player) {
    if (player.room) {
      if (player.room === room) return
      this.quitRoom(player)
    }

    room.addPlayer(player)
    player.room = room
    player.ready = false
    player.finished = false

    room.dispatchEvent({
      name: 'player-join',
      player: player.toNetworkObject(),
      room: room.toNetworkObject()
    })
  }

  /**
   * @param {Player} player 
   */
  quitRoom(player) {
    if (!player.room) return

    const room = player.room
    room.removePlayer(player)
    player.room = null

    room.dispatchEvent({
      name: 'player-quit',
      player: player.toNetworkObject(),
      room: room.toNetworkObject()
    })
  }
}

module.exports = Server
