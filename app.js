const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars');
const mocha = require('mocha');
require('dotenv/config');
const waitTimesRoute = require('./routes/waitTimes');

const app = express();
app.use(bodyParser.json());

app.set('view engine', 'hbs');

app.engine(
  'hbs',
  handlebars({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs',
  })
);

app.use(express.static('public'));
app.get('/', (req, res) => {
  res.render('main', { layout: 'index' });
});

const runner = new mocha({});

runner.addFile('./public/test/app.test.js');

runner.run(failures => {
  if (failures) {
    console.error(failures);
  } else {
    console.log('All Passed');
  }
});

app.use('/waitTimes', waitTimesRoute);
mongoose.connect(
  process.env.DB_CONNECTION,
  { useNewUrlParser: true, useUnifiedTopology: true }
  // () => {
  //   console.log('Connected to database');
  // }
);

PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Listening to port ${PORT}`));
