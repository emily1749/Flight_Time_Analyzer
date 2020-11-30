const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const WaitTimes = require('../models/WaitTimes');
const router = express.Router();

const app = express();

router.get('/', (req, res) => {
  res.json({ status: 'success', message: 'On the Wait Times page' });
});

router.get('/:airport', async (req, res) => {
  airport = req.params.airport;
  airport = airport.toLowerCase();
  let url = 'https://www.tsawaittimes.com/security-wait-times/' + airport;

  //First check if airport is already in the database
  WaitTimes.countDocuments({ airport: airport }, async (err, count) => {
    if (count === 1) {
      //If count is 1, it is in database. Return the matching document.
      try {
        const dbResult = await WaitTimes.find({
          airport: airport,
        });
        res.send(dbResult);
        return;
      } catch (error) {
        console.log(error.message);
      }
    } else {
      //If not in database, scrape TSA Wait Times webpage, store in database, and return new document

      //Scrape TSA Wait Times webpage
      request(url, async (error, response, html) => {
        if (!error) {
          var $ = cheerio.load(html);
          async function createJSON() {
            var self = this;
            self.thejson = {};
            $('.jumbotron div').each(function(index, value) {
              var key = $('div>div', this)
                .text()
                .match(/\d\s?..{5,}(a|p)m/);
              val = $('div>div>div', this)
                .text()
                .match(/\d/);

              if (val == null || key == null) {
                return;
              } else {
                self.thejson[key] = val;
              }
            });
            let result = self.thejson;

            //Not all airports have full data throughout the 24 hours
            //store "N/A" for airports that do not have information for certain times
            let counter = Object.keys(result).length - 12;
            counter = 12 - counter;
            let resultArray = [];

            for (let i = 0; i < 24; i++) {
              resultArray[i] = 'N/A';
            }
            // console.log("counter: " + counter);
            for (let i = counter, j = 0; i < 24; i++, j++) {
              resultArray[i] = Object.values(result)[j][0];
              // console.log("i: " + i + " value: " + Object.values(result)[j][0]);
            }

            //Check if result is valid, i.e. an improper airport code was input. Return message to enter valid code.
            if (resultArray[23] === 'N/A') {
              res.status(401);
              res.send({ msg: 'Please enter valid airport three letter code' });
              return;
            }

            //Create a new document for this airport, store in database
            const newAirport = await new WaitTimes({
              airport: airport,
              between12am1am: resultArray[0],
              between1am2am: resultArray[1],
              between2am3am: resultArray[2],
              between3am4am: resultArray[3],
              between4am5am: resultArray[4],
              between5am6am: resultArray[5],
              between6am7am: resultArray[6],
              between7am8am: resultArray[7],
              between8am9am: resultArray[8],
              between9am10am: resultArray[9],
              between10am11am: resultArray[10],
              between11am12pm: resultArray[11],
              between12pm1pm: resultArray[12],
              between1pm2pm: resultArray[13],
              between2pm3pm: resultArray[14],
              between3pm4pm: resultArray[15],
              between4pm5pm: resultArray[16],
              between5pm6pm: resultArray[17],
              between6pm7pm: resultArray[18],
              between7pm8pm: resultArray[19],
              between8pm9pm: resultArray[20],
              between9pm10pm: resultArray[21],
              between10pm11pm: resultArray[22],
              between11pm12am: resultArray[23],
            });

            //Save the new document and send it as JSON
            const savedTest = newAirport
              .save()
              .then(doc => {
                // console.log(doc);
                res.json(doc);
              })
              .catch(error => {
                console.error(error);
              });
          }

          createJSON();
        }
      });
    }
  });
});

module.exports = router;
