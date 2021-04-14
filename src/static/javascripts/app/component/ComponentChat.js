import Component from './Component.js'

export default class ComponentChat extends Component {
  /**
   * @param {string} name 
   * @param {Function} callback 
   */
  constructor(name, callback = undefined) {
    super(name)
    this.callback = callback
  }

  onMount() {
    this.rootRef = document.getElementById('chat-root')
    this.chatRef = document.getElementById('chat')

    const chatMessageRef = document.getElementById('chat-message')
    if (!(chatMessageRef instanceof HTMLInputElement)) {
      throw new Error('Chat message input has to be an html <input> element!')
    }
    this.chatMessageRef = chatMessageRef

    this.btnChatSendRef = document.getElementById('btn-chat-send')
    this.chatOuterRef = document.getElementById('chat-outer')

    this.btnChatSendRef.addEventListener('click', this.handleChatSend)
    this.chatMessageRef.addEventListener('keypress', this.handleChatKeyPress)
  }

  onUnmount() {
    this.btnChatSendRef.removeEventListener('click', this.handleChatSend)
    this.chatMessageRef.removeEventListener('keypress', this.handleChatKeyPress)
  }

  handleChatSend = async () => {
    const message = this.chatMessageRef.value
    if (!message) return

    this.chatMessageRef.value = ''

    await this.app.sendRequest('chat-message', { message })
    if (this.callback) this.callback()
  }

  /**
   * @param {KeyboardEvent} event 
   */
  handleChatKeyPress = event => {
    if (event.code === 'Enter') {
      this.handleChatSend()
    }
  }

  /**
   * @param {object} event 
   */
  onChatMessage(event) {
    this.appendChatMessage(event.message)
  }

  /**
   * @param {string} message 
   */
  appendChatMessage(message) {
    const messageRef = document.createElement('div')
    messageRef.innerHTML = message
    this.chatRef.appendChild(messageRef)
    this.chatOuterRef.scrollTop = this.chatOuterRef.scrollHeight
  }

  /**
   * @param {HTMLElement} targetRef 
   * @param {boolean} clear
   */
  mount(targetRef, clear = true) {
    if (clear) targetRef.innerHTML = ''
    targetRef.appendChild(this.rootRef)
    this.onMount()
  }
}
