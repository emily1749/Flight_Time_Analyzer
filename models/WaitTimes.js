const mongoose = require("mongoose");

const WaitTimesSchema = mongoose.Schema({
  airport: {
    type: String,
    required: true,
  },
  between12am1am: String,
  between1am2am: String,
  between2am3am: String,
  between3am4am: String,
  between4am5am: String,
  between5am6am: String,
  between6am7am: String,
  between7am8am: String,
  between8am9am: String,
  between9am10am: String,
  between10am11am: String,
  between11am12pm: String,
  between12pm1pm: String,
  between1pm2pm: String,
  between2pm3pm: String,
  between3pm4pm: String,
  between4pm5pm: String,
  between5pm6pm: String,
  between6pm7pm: String,
  between7pm8pm: String,
  between8pm9pm: String,
  between9pm10pm: String,
  between10pm11pm: String,
  between11pm12am: String,
});

module.exports = mongoose.model("WaitTimes", WaitTimesSchema);
