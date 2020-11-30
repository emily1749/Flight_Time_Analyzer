//Initialize map
L.mapquest.key = 'KEY';
let map = L.mapquest.map('map', {
  center: [39.8283, -98.5795],
  layers: L.mapquest.tileLayer('map'),
  zoom: 4,
  zoomControl: false,
});

let directionsControl = L.mapquest
  .directionsControl({
    className: 'directionsControl',
    directions: {
      options: {
        timeOverage: 25,
        doReverseGeocode: false,
      },
    },
    directionsLayer: {
      startMarker: {
        title: 'Drag to change location',
        draggable: true,
        icon: 'marker-start',
        iconOptions: {
          size: 'sm',
        },
      },
      endMarker: {
        draggable: true,
        title: 'Drag to change location',
        icon: 'marker-end',
        iconOptions: {
          size: 'sm',
        },
      },
      viaMarker: {
        title: 'Drag to change route',
      },
      routeRibbon: {
        showTraffic: true,
      },
      alternateRouteRibbon: {
        showTraffic: true,
      },
      paddingTopLeft: [450, 20],
      paddingBottomRight: [180, 20],
    },
    startInput: {
      compactResults: true,
      disabled: false,
      location: {},
      placeholderText: 'Starting point or click on the map...',
      geolocation: {
        enabled: true,
      },
      clearTitle: 'Remove starting point',
    },
    endInput: {
      compactResults: true,
      disabled: false,
      location: {},
      placeholderText: 'Destination',
      geolocation: {
        enabled: true,
      },
      clearTitle: 'Remove this destination',
    },
    addDestinationButton: {
      enabled: true,
      maxLocations: 10,
    },
    routeTypeButtons: {
      enabled: true,
    },
    reverseButton: {
      enabled: true,
    },
    optionsButton: {
      enabled: true,
    },
    routeSummary: {
      enabled: true,
      compactResults: false,
    },
    narrativeControl: {
      enabled: true,
      compactResults: false,
      interactive: true,
    },
  })
  .addTo(map);

L.mapquest.key = 'FofZ9naiaa4m9XRoUHWOqqws3pnaTqFn';

var options = {
  q: 'Denver, CO',
  collection: 'address,adminArea,airport,poi',
};

L.mapquest.searchAhead.prediction(options, searchAheadCallback);

function searchAheadCallback(error, result) {
  console.log(result);
}
map.addControl(L.mapquest.locatorControl());

//Settings and Functions
settings = {
  // Receives input time, will convert it to total minutes
  convertTimeToMinutes: time => {
    timeResult = time.split(':');
    // timeHour = parseInt(timeResult[0]);
    return Math.floor(parseInt(timeResult[0]) * 60 + parseInt(timeResult[1]));
  },

  getTimeHour: time => {
    timeResult = time.split(':');
    timeHour = parseInt(timeResult[0]);
    return timeHour;
  },

  // Receives minutes, will convert it to a time
  convertMinutesToTime: minutes => {
    let timeMinutes = '';
    // If the minutes is negative, it's the previous day. Add 24 hours to it
    if (minutes < 0) {
      minutes = minutes + 24 * 60;
    }
    //If the minutes is less than 10, need to add the 0 placeholder
    if (parseInt(minutes) % 60 < 10) {
      timeMinutes = '0' + String(parseInt(minutes) % 60);
      return String(Math.floor(parseInt(minutes) / 60)) + ':' + timeMinutes;
    }
    //Return the time
    else {
      return (
        Math.floor(parseInt(minutes) / 60) + ':' + (parseInt(minutes) % 60)
      );
    }
  },

  // Convert time from 24 hours to AM/PM
  convertTime: time => {
    let [hours, minutes] = time.split(':');
    if (parseInt(hours) > 12) {
      return String(parseInt(hours) - 12) + ':' + minutes + ' PM';
    }
    if (parseInt(hours) < 1) {
      return String(parseInt(hours) + 12) + ':' + minutes + 'PM';
    } else {
      return time + ' AM';
    }
  },
};

// Display final result
document.getElementById('getResult').addEventListener('click', () => {
  let airport = '';
  let stringTimeToAirport = '';
  let minutesToAirport = 0;
  let securityCheckMinutes = 0;
  let timeHour = 0;
  let fetchResult = [];
  let fetchUrl = '';
  let flightTime = '';

  let displayResult = document.getElementById('display-result');

  // Use Regular Expressions to retrieve input airport from map
  airport = directionsControl._inputControls[1]._input.value.match(
    /\([A-Z]{3,}\)/
  );

  // Check if airport was valid input
  if (!airport) {
    displayResult.textContent =
      'Please enter a valid US airport as the destination';
    displayResult.classList.add('red');
  }
  airport = airport[0].match(/[A-Z]{3,3}/);

  // Use Regular Expressions to retrieve calculated time from map
  stringTimeToAirport = directionsControl._addDestinationControl.parentElement.textContent.match(
    /About.{1,15}minute/
  );
  stringTimeToAirport = String(stringTimeToAirport);
  if (stringTimeToAirport.length > 15) {
    let hour = stringTimeToAirport.match(/About.{1,5}hour/);
    hour = String(hour);
    hour = parseInt(hour.match(/\d{1,2}/));
    stringTimeToAirport = String(stringTimeToAirport);
    let minute = stringTimeToAirport.match(/hour.{1,6}minute/);
    minute = String(minute);
    minute = parseInt(minute.match(/\d{1,2}/));
    minutesToAirport = hour * 60 + minute;
  } else {
    minutesToAirport = parseInt(stringTimeToAirport.match(/\d{1,6}/));
  }

  // Get flight boarding time
  flightTime = document.getElementById('flightAppt').value;

  // Check if flight boarding time was valid input
  if (!flightTime) {
    displayResult.textContent = 'Please enter a valid time for flight boarding';
    displayResult.classList.add('red');
  }

  // Convert flight time to minutes and get the hour of the flight
  settings.convertTimeToMinutes(flightTime);
  timeHour = settings.getTimeHour(flightTime);

  // Fetch airport wait times data
  fetchUrl = String('http://localhost:5000/waitTimes/' + airport);
  fetch(fetchUrl)
    .then(result => {
      return result.json();
    })
    .then(data => {
      let resultTime = 0;
      fetchResult = data[0];
      securityCheckMinutes = Object.values(fetchResult)[timeHour + 2];

      for (let i = 1; i < 24; i++) {
        // Check that data for input is not N/A
        // If N/A, use first available time from data
        if (securityCheckMinutes != 'N/A') {
          break;
        } else {
          securityCheckMinutes = Object.values(fetchResult)[timeHour + 2 + i];
        }
      }

      // Calculate the result time to leave to airport
      resultTime = settings.convertMinutesToTime(
        Math.floor(
          settings.convertTimeToMinutes(flightTime) -
            parseInt(securityCheckMinutes) -
            minutesToAirport -
            30
        )
      );

      // Check that the minutes to airport was valid. If not, needs valid address

      if (!minutesToAirport) {
        displayResult.textContent = 'Please enter a valid starting address';
        displayResult.classList.add('red');
      }
      if (minutesToAirport && flightTime && airport) {
        // Display result
        displayResult.classList.remove('red');
        displayResult.textContent =
          'Security will take ' +
          securityCheckMinutes +
          ' minutes. To make your flight, leave at: ' +
          settings.convertTime(resultTime);
      }
    })
    .catch(error => console.error(error));
});
