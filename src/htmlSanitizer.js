class HtmlSanitizer {
  /**
   * Remove end of line characters from a string
   *
   * @static
   * @param {String} str
   * @returns {String}
   * @memberof Parser
   */
  static removeEolChars(str) {
    return str.replace(/\\r\\n/g, '');
  }

  /**
   * Trim off spaces between HTML tags from a string
   *
   * @static
   * @param {String} str
   * @returns {String}
   * @memberof Parser
   */
  static trimSpaces(str) {
    return str.replace(/>\s*</g, '><');
  }

  /**
   * Normalize all escaped quotes ('\"') of a string into classic quotes
   *
   * @static
   * @param {String} str
   * @returns {String}
   * @memberof Parser
   */
  static normalizeQuotes(str) {
    return str.replace(/\\"/g, '"');
  }

  /**
   * Sanitize a string
   *
   * @static
   * @param {String} str
   * @returns {String}
   * @memberof Parser
   */
  static sanitize(str) {
    const eolCharsFreeStr = this.removeEolChars(str);
    const trimmedStr = this.trimSpaces(eolCharsFreeStr);
    const normalizedStr = this.normalizeQuotes(trimmedStr);

    return normalizedStr;
  }
}

module.exports = HtmlSanitizer;
