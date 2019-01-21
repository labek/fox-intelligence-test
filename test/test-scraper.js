const { expect } = require('chai');
const sinon = require('sinon');
const Scraper = require('../src/scraper');

describe('> scraper', () => {
  let htmlString = null;
  let passengerHtmlStr = null;
  let scraper = null;

  before(() => {
    passengerHtmlStr = `<table class="passengers"><tbody><tr><td></td></tr><tr><td></td><td class="typology"> <strong>2e&nbsp;passager</strong> <br>(26 à 59 ans) </td><td class="fare-details"><span class="fare-name">BILLET CARTE ENFANT+</span> : Carte Enfant+ en cours de validité à présenter à bord du train. Billet échangeable et remboursable sans frais à l'émission du billet puis avec des frais de 5 € la veille et le jour du départ. A ces frais s'ajoute l'éventuelle différence de prix entre l'ancien et le nouveau billet. Billet non échangeable et non remboursable après le départ. </td><td><img src="http://www.voyages-sncf.com/imgs/emails/fr/placement/placement-place-assise.png" alt="Place assise"><hr> Voiture 001 - Place 034 <br> <br> Salle basse - Fenêtre - Club quatre </td></tr></tbody></table>`;
  });

  after(() => {
    passengerHtmlStr = null;
  });

  afterEach(() => {
    htmlString = null;
    scraper = null;
  });

  describe('> getOrderYear', () => {
    it('it should return the year of the order', (done) => {
      htmlString = `<table id="intro"><tbody><tr></tr><tr></tr><tr><td>2019&nbsp;hello</td></tr></tbody></table>`;
      scraper = new Scraper(htmlString);
      const res = scraper.getTravelYear();

      expect(res).to.be.a.string;
      expect(res).to.equal('2019');
      done();
    });
  });

  describe('> getTripInfo', () => {
    it('it should return the code of the order', (done) => {
      htmlString = `<td class="pnr-ref"><span class="pnr-info">   SNIKXP   </span></td>`;
      scraper = new Scraper(htmlString);
      const res = scraper.getTripInfo('code');

      expect(res).to.be.a.string;
      expect(res).to.equal('SNIKXP');
      done();
    });

    it('it should return the name whom did the order', (done) => {
      htmlString = `<td class="pnr-name"><span class="pnr-info">   DUPONT   </span></td>`;
      scraper = new Scraper(htmlString);
      const res = scraper.getTripInfo('name');

      expect(res).to.be.a.string;
      expect(res).to.equal('DUPONT');
      done();
    });
  });

  describe('> getTotalPrice', () => {
    it('should return the total price of the order', (done) => {
      htmlString = `<table class="total-amount"><tbody><tr><td> TOTAL payé en ligne : </td><td> 768,50 € </td></tr></tbody></table>`;
      scraper = new Scraper(htmlString);

      const res = scraper.getTotalPrice();

      expect(res).to.equal(768.5);
      done();
    });
  });

  describe('> getPriceItem', () => {
    it('should return a price of the order w/ "tbody" html tag within', (done) => {
      htmlString = `<table class="product-header"><tbody><tr><td></td><td> 4 passagers </td><td> 378,00€ </td></tr></tbody></table>`;
      scraper = new Scraper(htmlString);
      const res = scraper.getPriceItem(scraper.$('.product-header'));

      expect(res).to.equal(378);
      done();
    });

    it('should return a price of the order /w "tbody" html tag within', (done) => {
      htmlString = `<table class="product-header"><td></td><td> 4 passagers </td><td> 378,00€ </td></table>`;
      scraper = new Scraper(htmlString);
      const res = scraper.getPriceItem(scraper.$('.product-header'));

      expect(res).to.equal(378);
      done();
    });
  });

  describe('> getPassengerType', () => {
    it('should return the type of passenger', (done) => {
      htmlString = `<td class="fare-details"><span class="fare-name">BILLET CARTE ENFANT+</span> : Carte Enfant+ en cours de validité à présenter à bord du train. Billet échangeable et remboursable sans frais à l'émission du billet puis avec des frais de 5 € la veille et le jour du départ. A ces frais s'ajoute l'éventuelle différence de prix entre l'ancien et le nouveau billet. Billet non échangeable et non remboursable après le départ. <br><br> <img src="http://www.voyages-sncf.com/imgs/emails/avantage-inclus-ico.png" alt="">&nbsp;<strong>Fidélité Voyageur</strong> : vous cumulez des avantages sur votre aller-retour (2) </td>`;
      scraper = new Scraper(htmlString);
      const res = scraper.getPassengerType();

      expect(res).to.be.a.string;
      expect(res).to.equal('échangeable');
      done();
    });
  });

  describe('> getPassengerAge', () => {
    it('should return the age of passenger', (done) => {
      htmlString = `<td class="typology"> <strong>2e&nbsp;passager</strong> <br>(26 à 59 ans) </td>`;
      scraper = new Scraper(htmlString);
      const res = scraper.getPassengerAge();

      expect(res).to.be.a.string;
      expect(res).to.equal('(26 à 59 ans)');
      done();
    });
  });

  describe('> getPassengers', () => {
    it('should return the list of passengers', (done) => {
      scraper = new Scraper(passengerHtmlStr);

      const getPassengerTypeSpy = sinon.spy(scraper, 'getPassengerType');
      const getPassengerAgeSpy = sinon.spy(scraper, 'getPassengerAge');
      const res = scraper.getPassengers();

      expect(res).to.be.an.instanceOf(Array);
      expect(res).to.have.lengthOf(1);
      expect(res[0]).to.be.an.instanceOf(Object);
      expect(res[0]).to.have.keys('type', 'age');
      expect(getPassengerTypeSpy.calledOnce).to.equal(true);
      expect(getPassengerAgeSpy.calledOnce).to.equal(true);

      expect(res[0]).to.deep.equals({
        type: 'échangeable',
        age: '(26 à 59 ans)'
      });

      getPassengerTypeSpy.restore();
      getPassengerAgeSpy.restore();
      done();
    });
  });

  describe('> getTravelDates', () => {
    it('should return an array of travel date', (done) => {
      htmlString = `<td class="product-travel-date"> Vendredi 2 Septembre </td>`;
      scraper = new Scraper(htmlString);

      const getTravelYearStub = sinon.stub(scraper, 'getTravelYear');
      getTravelYearStub.returns('2016');

      const res = scraper.getTravelDates();

      expect(res).to.be.instanceOf(Array);
      expect(res).to.have.lengthOf(1);
      expect(res[0]).to.deep.equals('2016-09-02 00:00:00.000Z');

      getTravelYearStub.restore();
      done();
    });
  });

  describe('> getTrainInfo', () => {
    it('should return an array of object depending on the selector passed as parameter', (done) => {
      htmlString = `<td class="travel-way"> Retour </td>`;
      scraper = new Scraper(htmlString);

      const res = scraper.getTrainInfo('td.travel-way');

      expect(res).to.be.instanceOf(Array);
      expect(res).to.have.lengthOf(1);
      expect(res[0]).to.deep.equal('Retour');
      done();
    });
  });

  describe('> getTravelTypes', () => {
    it('should return an array of object depending on the selector passed as parameter', (done) => {
      htmlString = `<td class="travel-way"> Retour </td>`;
      scraper = new Scraper(htmlString);

      const res = scraper.getTrainInfo('td.travel-way');

      expect(res).to.be.instanceOf(Array);
      expect(res).to.have.lengthOf(1);
      expect(res[0]).to.equal('Retour');
      done();
    });
  });

  describe('> getDepartureTimes', () => {
    it('should return an array of departure times', (done) => {
      htmlString = `<td class="origin-destination-hour segment-departure"> 16h37 </td>`;
      scraper = new Scraper(htmlString);

      const res = scraper.getDepartureTimes();

      expect(res).to.be.an.instanceOf(Array);
      expect(res).to.have.lengthOf(1);
      expect(res[0]).to.equal('16:37');
      done();
    });
  });

  describe('> getDepartureStations', () => {
    it('should return an array of departure stations', (done) => {
      htmlString = `<td class="origin-destination-station segment-departure"> PARIS GARE DE LYON </td>`;
      scraper = new Scraper(htmlString);

      const res = scraper.getDepartureStations();

      expect(res).to.be.an.instanceOf(Array);
      expect(res).to.have.lengthOf(1);
      expect(res[0]).to.equal('PARIS GARE DE LYON');
      done();
    });
  });

  describe('> getArrivalTimes', () => {
    it('should return an array of arrival times', (done) => {
      htmlString = `<td class="origin-destination-border origin-destination-hour segment-arrival"> 19h17 </td>`;
      scraper = new Scraper(htmlString);

      const res = scraper.getArrivalTimes();

      expect(res).to.be.an.instanceOf(Array);
      expect(res).to.have.lengthOf(1);
      expect(res[0]).to.equal('19:17');
      done();
    });
  });

  describe('> getArrivalStations', () => {
    it('should return an array of arrival stations', (done) => {
      htmlString = `<td class="origin-destination-border origin-destination-station segment-arrival"> AVIGNON TGV </td>`;
      scraper = new Scraper(htmlString);

      const res = scraper.getArrivalStations();

      expect(res).to.be.an.instanceOf(Array);
      expect(res).to.have.lengthOf(1);
      expect(res[0]).to.equal('AVIGNON TGV');
      done();
    });
  });

  describe('> getTrainTypesAndNumbers', () => {
    const typeNumberHtmlStr = `<td class="segment"> TGV </td><td class="segment"> 6121 </td>`;

    it('should return an array of train types', (done) => {
      scraper = new Scraper(typeNumberHtmlStr);

      const res = scraper.getTrainTypesAndNumbers('type');

      expect(res).to.be.an.instanceOf(Array);
      expect(res).to.have.lengthOf(1);
      expect(res[0]).to.equal('TGV');
      done();
    });

    it('should return an array of train numbers', (done) => {
      scraper = new Scraper(typeNumberHtmlStr);

      const res = scraper.getTrainTypesAndNumbers('number');

      expect(res).to.be.an.instanceOf(Array);
      expect(res).to.have.lengthOf(1);
      expect(res[0]).to.equal('6121');
      done();
    });
  });

  describe('> getTrainItem', () => {
    it('should return an item of "trains" array', (done) => {
      scraper = new Scraper('<div></div>');

      const departureTimeStub = sinon.stub(scraper, 'getDepartureTimes');
      const departureStationStub = sinon.stub(scraper, 'getDepartureStations');
      const arrivalTimeStub = sinon.stub(scraper, 'getArrivalTimes');
      const arrivalStationStub = sinon.stub(scraper, 'getArrivalStations');
      const trainTypesAndNumbersStub = sinon.stub(
        scraper,
        'getTrainTypesAndNumbers'
      );

      departureTimeStub.returns(['16:37']);
      departureStationStub.returns(['PARIS GARE DE LYON']);
      arrivalTimeStub.returns(['19:17']);
      arrivalStationStub.returns(['AVIGNON TGV']);
      const typeStub = trainTypesAndNumbersStub.onFirstCall().returns(['TGV']);

      const numberStub = trainTypesAndNumbersStub
        .onSecondCall()
        .returns(['6121']);

      const res = scraper.getTrainItem(0);

      expect(res).to.be.instanceOf(Object);
      expect(res).to.deep.equal({
        departureTime: '16:37',
        departureStation: 'PARIS GARE DE LYON',
        arrivalTime: '19:17',
        arrivalStation: 'AVIGNON TGV',
        type: 'TGV',
        number: '6121'
      });

      expect(departureTimeStub.calledOnce).to.equal(true);
      expect(departureStationStub.calledOnce).to.equal(true);
      expect(arrivalTimeStub.calledOnce).to.equal(true);
      expect(arrivalStationStub.calledOnce).to.equal(true);
      expect(trainTypesAndNumbersStub.calledTwice).to.equal(true);

      departureTimeStub.restore();
      departureStationStub.restore();
      arrivalTimeStub.restore();
      arrivalStationStub.restore();
      typeStub.restore();
      numberStub.restore();
      done();
    });
  });

  describe('> getRoundTrips', () => {
    it('should return the actual "roundTrips" object', (done) => {
      htmlString = `<table class="product-details"><tbody><tr>  <td width="55" align="center" rowspan="2" class="travel-way" style="font-weight:bold;"> Aller </td>  <td width="45" class="origin-destination-hour segment-departure" style="font-weight:bold;font-size:12px;color:#e05206;padding-top:5px;padding-bottom:2px;"> 16h57 </td>  <td width="245" class="origin-destination-station segment-departure" style="font-weight:bold;padding-top:5px;padding-bottom:2px;"> PARIS GARE DE LYON </td>  <td width="70" align="center" rowspan="2" class="segment" style="padding:0 3px;"> TGV </td>  <td align="center" rowspan="2" class="segment" style="padding:0 3px;"> 6687 </td>  <td width="115" align="center" rowspan="2" class="segment segment-departure" style="padding:0 3px;padding-top:5px;padding-bottom:2px;"> <img src="http://www.voyages-sncf.com/imgs/services/HAN.gif" alt="">&nbsp;<img src="http://www.voyages-sncf.com/imgs/services/BAR.gif" alt="">&nbsp; </td>  <td width="70" align="center" rowspan="2"> 1e classe </td> </tr> <tr>  <td width="45" class="origin-destination-border origin-destination-hour segment-arrival" style="border-top:1px solid #4d4f53;font-weight:bold;font-size:12px;color:#e05206;padding-top:2px;padding-bottom:5px;"> 18h56 </td>  <td class="origin-destination-border origin-destination-station segment-arrival" style="border-top:1px solid #4d4f53;font-weight:bold;padding-top:2px;padding-bottom:5px;"> LYON PART DIEU </td> </tr></tbody></table>`;
      scraper = new Scraper(htmlString);

      const travelDates = ['2016-09-02 00:00:00.000Z'];
      const passengers = [{ type: 'échangeable', age: '(26 à 59 ans)' }];

      const getPassengersStub = sinon
        .stub(scraper, 'getPassengers')
        .returns(passengers);

      const getTravelDatesStub = sinon
        .stub(scraper, 'getTravelDates')
        .returns(travelDates);

      const res = scraper.getRoundTrips();

      expect(res).to.be.instanceOf(Array);
      expect(res).to.have.lengthOf(1);
      expect(res[0]).to.have.keys(['type', 'date', 'trains']);
      expect(res[0].type).to.equal('Aller');
      expect(res[0].date).to.equal(travelDates[0]);
      expect(res[0].trains).to.be.instanceOf(Array);
      expect(res[0].trains).to.have.lengthOf(1);
      expect(res[0].trains[0]).to.contains.keys('passengers');

      expect(res[0].trains[0]).to.deep.equal({
        departureTime: '16:57',
        departureStation: 'PARIS GARE DE LYON',
        arrivalTime: '18:56',
        arrivalStation: 'LYON PART DIEU',
        type: 'TGV',
        number: '6687',
        passengers
      });

      expect(getTravelDatesStub.calledOnce).to.equal(true);
      expect(getPassengersStub.calledOnce).to.equal(true);

      getTravelDatesStub.restore();
      getPassengersStub.restore();
      done();
    });
  });

  describe('> getPrices', () => {
    it('should return the actual "prices" array', (done) => {
      htmlString = `<table class="product-header"><tbody><tr>  <td width="50" align="center" class="product-type" style="color:#ffffff;"> <img src="http://www.voyages-sncf.com/imgs/emails/ftl/icon-train.png" alt="Train Aller-retour"> </td>  <td width="5" style="color:#ffffff;"><img src="http://www.voyages-sncf.com/imgs/emails/separateur.png" alt=" | "></td>  <td class="cell" style="color:#ffffff;padding:1px 8px;"> <p class="od" style="margin:4px 0;padding:0;">PARIS <img src="http://www.voyages-sncf.com/imgs/emails/ftl/journey-roundtrip.png" alt="<=>"> LYON</p> </td>  <td width="5" style="color:#ffffff;"><img src="http://www.voyages-sncf.com/imgs/emails/separateur.png" alt=" | "></td>  <td width="100" align="center" style="color:#ffffff;"> 4 passagers </td>  <td width="5" style="color:#ffffff;"><img src="http://www.voyages-sncf.com/imgs/emails/separateur.png" alt=" | "></td>  <td width="85" align="right" class="cell" style="color:#ffffff;padding:1px 8px;"> 315,50 € </td> </tr></tbody></table>`;
      scraper = new Scraper(htmlString);

      const getPriceItemSpy = sinon.spy(scraper, 'getPriceItem');
      const res = scraper.getPrices();

      expect(res).to.be.an.instanceOf(Array);
      expect(res).to.have.lengthOf(1);
      expect(res[0]).to.have.keys('value');
      expect(res[0].value).to.equal(315.5);
      expect(getPriceItemSpy.calledOnce).to.equal(true);

      getPriceItemSpy.restore();
      done();
    });
  });

  describe('> generate', () => {
    it('should return the result of the file', (done) => {
      scraper = new Scraper('');
      const roundTripItem = [
        {
          type: 'Aller',
          date: '2016-09-02 00:00:00.000Z',
          trains: [
            {
              departureTime: '16:57',
              departureStation: 'PARIS GARE DE LYON',
              arrivalTime: '18:56',
              arrivalStation: 'LYON PART DIEU',
              type: 'TGV',
              number: '6687'
            }
          ]
        }
      ];

      const getTripInfoStub = sinon.stub(scraper, 'getTripInfo');
      const getTotalPriceStub = sinon.stub(scraper, 'getTotalPrice');
      const getRoundTripsStub = sinon.stub(scraper, 'getRoundTrips');
      const getPricesStub = sinon.stub(scraper, 'getPrices');

      getTripInfoStub.onFirstCall().returns('CODE');
      getTripInfoStub.onSecondCall().returns('NAME');
      getTotalPriceStub.returns(100);
      getRoundTripsStub.returns(roundTripItem);
      getPricesStub.returns([{ value: 100 }]);

      const res = scraper.generate();

      expect(res).to.be.an.instanceOf(Object);
      expect(res).to.have.keys(['status', 'result']);
      expect(res.result).to.have.keys(['trips', 'custom']);
      expect(res.result.trips).to.have.lengthOf(1);
      expect(res.result.trips[0]).to.have.keys(['code', 'name', 'details']);
      expect(res.result.trips[0].code).to.equal('CODE');
      expect(res.result.trips[0].name).to.equal('NAME');
      expect(res.result.trips[0].details).to.have.keys(['price', 'roundTrips']);
      expect(res.result.trips[0].details.price).to.equal(100);
      expect(res.result.trips[0].details.roundTrips).to.be.instanceOf(Array);
      expect(res.result.trips[0].details.roundTrips[0]).to.have.keys([
        'type',
        'date',
        'trains'
      ]);

      expect(res.result.trips[0].details.roundTrips).to.deep.equal(
        roundTripItem
      );

      expect(res.result.custom).to.have.keys('prices');
      expect(res.result.custom.prices).to.be.instanceOf(Array);
      expect(res.result.custom.prices[0]).to.deep.equal({ value: 100 });

      expect(getTripInfoStub.calledTwice).to.equal(true);
      expect(getTotalPriceStub.calledOnce).to.equal(true);
      expect(getRoundTripsStub.calledOnce).to.equal(true);
      expect(getPricesStub.calledOnce).to.equal(true);

      getTripInfoStub.restore();
      getTotalPriceStub.restore();
      getRoundTripsStub.restore();
      getPricesStub.restore();
      done();
    });
  });
});
