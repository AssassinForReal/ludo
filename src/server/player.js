const Room = require('./room')

class Player {
  /**
   * @param {string} id 
   * @param {string} secretId 
   */
  constructor(id, secretId) {
    this.id = id
    this.secretId = secretId
    this.username = ''

    /**
     * @type {Room}
     */
    this.room = null
    this.events = []
    this.ready = false
    this.color = null
    this.counters = []
    this.finished = false
  }

  /**
   * @param {object} event 
   */
  queueEvent(event) {
    this.events.push(event)
  }

  /**
   * @returns {object}
   */
  toNetworkObject() {
    return {
      id: this.id,
      username: this.username,
      ready: this.ready,
      color: this.color,
      counters: this.counters,
      finished: this.finished
    }
  }
}

module.exports = Player
