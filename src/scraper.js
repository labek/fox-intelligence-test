const cheerio = require('cheerio');
const Utils = require('./utils');

const modes = Object.freeze({
  code: 'td.pnr-ref',
  name: 'td.pnr-name'
});

class Scraper {
  /**
   * Creates an instance of Scraper.
   *
   * @param {String} htmlString
   * @memberof Scraper
   */
  constructor(htmlString) {
    this.$ = cheerio.load(htmlString, {
      xml: {
        normalizeWhitespace: true
      }
    });
  }

  /**
   * Get the year of the travel
   *
   * @returns {String}
   * @memberof Scraper
   */
  getTravelYear() {
    const data = this.$('#intro')
      .children('tbody')
      .children('tr')
      .last()
      .children('td')
      .text();

    const splittedStr = data.split('&nbsp;')[0];
    const length = splittedStr.length;

    return splittedStr.slice(length - 4, length);
  }

  /**
   * Get informations related to the trip by the selected mode
   *
   * @param {String} value
   * @returns {String}
   * @memberof Scraper
   */
  getTripInfo(value) {
    const selector = modes[value];

    return this.$(selector)
      .last()
      .children('span.pnr-info')
      .text()
      .replace(/ /g, '');
  }

  /**
   * Get the total price of order
   *
   * @returns {Number}
   * @memberof Scraper
   */
  getTotalPrice() {
    return this.getPriceItem('table.total-amount');
  }

  /**
   * Get an item of "prices" of "custom" section
   *
   * @param {CheerioElement} element
   * @returns {Number}
   * @memberof Scraper
   */
  getPriceItem(element) {
    const selector = this.$(element);
    const hasTbody = selector.find('tbody').length === 1;

    const value = hasTbody
      ? selector
        .children('tbody')
        .children('tr')
        .children('td')
        .last()
        .text()
      : selector
        .children('td')
        .last()
        .text();

    return Utils.sanitizePriceValue(value);
  }

  /**
   * Get the type of passenger
   *
   * @returns {String}
   * @memberof Scraper
   */
  getPassengerType() {
    const passengerType = this.$('td.fare-details')
      .first()
      .text()
      .trim();

    return passengerType.split('. Billet ')[1].split(' ')[0];
  }

  /**
   * Get the "age" label of passenger
   *
   * @returns {String}
   * @memberof Scraper
   */
  getPassengerAge() {
    const passengerAge = this.$('td.typology')
      .first()
      .text()
      .trim();

    return passengerAge.split(';passager')[1].trim();
  }

  /**
   * Get the array of passengers
   *
   * @returns {Array}
   * @memberof Scraper
   */
  getPassengers() {
    const type = this.getPassengerType();
    const age = this.getPassengerAge();

    return this.$('table.passengers')
      .first()
      .children('tbody')
      .first()
      .children('tr')
      .map((index, el) => {
        if (
          this.$(el)
            .children('td')
            .text() === ''
        ) {
          return null;
        }

        return { type, age };
      })
      .toArray();
  }

  /**
   * Get the list of travel dates
   *
   * @returns {Array}
   * @memberof Scraper
   */
  getTravelDates() {
    const travelYear = this.getTravelYear();

    return this.$('td.product-travel-date')
      .map((index, el) => {
        const res = this.$(el)
          .text()
          .trim();

        return Utils.formatDateValue(`${res} ${travelYear}`);
      })
      .toArray();
  }

  /**
   * Get informations related to "trains" array
   *
   * @param {CheerioSelector} selector
   * @returns {Array}
   * @memberof Scraper
   */
  getTrainInfo(selector) {
    return this.$(selector)
      .map((index, el) =>
        this.$(el)
          .text()
          .trim()
      )
      .toArray();
  }

  /**
   * Get travel types
   *
   * @returns {Array}
   * @memberof Scraper
   */
  getTravelTypes() {
    return this.getTrainInfo('td.travel-way');
  }

  /**
   * Get departure times
   *
   * @returns {Array}
   * @memberof Scraper
   */
  getDepartureTimes() {
    const departureTimes = this.getTrainInfo(
      'td.origin-destination-hour.segment-departure'
    );

    return departureTimes.map((it) => Utils.replaceTimeDelimiter(it));
  }

  /**
   * Get departure stations
   *
   * @returns {Array}
   * @memberof Scraper
   */
  getDepartureStations() {
    return this.getTrainInfo('td.origin-destination-station.segment-departure');
  }

  /**
   * Get arrival times
   *
   * @returns {Array}
   * @memberof Scraper
   */
  getArrivalTimes() {
    const arrivalTimes = this.getTrainInfo(
      'td.origin-destination-border.origin-destination-hour.segment-arrival'
    );

    return arrivalTimes.map((it) => Utils.replaceTimeDelimiter(it));
  }

  /**
   * Get arrival stations
   *
   * @returns {Array}
   * @memberof Scraper
   */
  getArrivalStations() {
    return this.getTrainInfo(
      'td.origin-destination-border.origin-destination-station.segment-arrival'
    );
  }

  /**
   * Get trains' types and numbers depending on the selected mode
   *
   * @param {String} mode
   * @returns {Array}
   * @memberof Scraper
   */
  getTrainTypesAndNumbers(mode) {
    const data = this.getTrainInfo('td.segment');

    return data
      .map((it) => it.replace(/&nbsp;/g, ''))
      .filter((it, index) => {
        if (!it) {
          return null;
        }

        return mode === 'type' ? index % 2 === 0 : index % 2 !== 0;
      });
  }

  /**
   * Get an item of the "trains" array
   *
   * @param {Number} index
   * @returns {Object}
   * @memberof Scraper
   */
  getTrainItem(index) {
    const departureTime = this.getDepartureTimes()[index];
    const departureStation = this.getDepartureStations()[index];
    const arrivalTime = this.getArrivalTimes()[index];
    const arrivalStation = this.getArrivalStations()[index];
    const type = this.getTrainTypesAndNumbers('type')[index];
    const number = this.getTrainTypesAndNumbers('number')[index];

    return {
      departureTime,
      departureStation,
      arrivalTime,
      arrivalStation,
      type,
      number
    };
  }

  /**
   * Get the "roundTrips" array
   *
   * @returns {Array}
   * @memberof Scraper
   */
  getRoundTrips() {
    const selector = this.$('table.product-details');
    const count = selector.length;

    const travelDates = this.getTravelDates();
    const travelTypes = this.getTravelTypes();

    return selector
      .map((index) => {
        const isLastItem = index === count - 1;
        const trainItem = this.getTrainItem(index);

        const trains = isLastItem
          ? { ...trainItem, passengers: this.getPassengers() }
          : trainItem;

        return {
          type: travelTypes[index],
          date: travelDates[index],
          trains: [trains]
        };
      })
      .toArray();
  }

  /**
   * Get the array of prices
   *
   * @returns {Object}
   * @memberof Scraper
   */
  getPrices() {
    return this.$('.product-header')
      .map((index, el) => ({ value: this.getPriceItem(el) }))
      .toArray();
  }

  /**
   * Generate the result file
   *
   * @returns {Object}
   * @memberof Scraper
   */
  generate() {
    return {
      status: 'ok',
      result: {
        trips: [
          {
            code: this.getTripInfo('code'),
            name: this.getTripInfo('name'),
            details: {
              price: this.getTotalPrice(),
              roundTrips: this.getRoundTrips()
            }
          }
        ],
        custom: {
          prices: this.getPrices()
        }
      }
    };
  }
}

module.exports = Scraper;
