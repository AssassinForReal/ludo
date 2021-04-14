export default class VoiceEngine {
  static create() { }

  /**
   * @param {string} text 
   */
  static speak(text) {
    const utterance = new SpeechSynthesisUtterance(text)
    speechSynthesis.speak(utterance)
  }
}
