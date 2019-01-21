const moment = require('moment');

moment.locale('fr');

class Utils {
  /**
   * Sanitize a price string into an actual price
   *
   * @static
   * @param {String} val
   * @returns {Number}
   * @memberof Utils
   */
  static sanitizePriceValue(val) {
    return Number(
      val
        .replace(/€/g, '')
        .replace(/,/g, '.')
        .replace(/&nbsp;/g, '')
    );
  }

  /**
   * Format a date in a specific format into another
   *
   * @static
   * @param {String} dateValue
   * @returns {String}
   * @memberof Utils
   */
  static formatDateValue(dateValue) {
    const initialDateFormat = 'dddd D MMMM YYYY';

    if (!dateValue || !moment(dateValue, initialDateFormat, true).isValid()) {
      return '';
    }

    const formattedDate = moment
      .utc(dateValue, initialDateFormat)
      .format('YYYY-MM-DD HH:mm:ss.SSS');

    return `${formattedDate}Z`;
  }

  /**
   * Replace the delimiter of a time string
   *
   * @static
   * @param {String} value
   * @returns {String}
   * @memberof Utils
   */
  static replaceTimeDelimiter(value) {
    return String(value).replace('h', ':');
  }
}

module.exports = Utils;
