class RoomState {
  static Waiting = 'waiting'
  static Countdown = 'countdown'
  static Ingame = 'ingame'
  static Ended = 'ended'
}

Object.freeze(RoomState)

module.exports = RoomState
