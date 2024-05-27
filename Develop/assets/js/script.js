let cityInputEl = $("#city-input");
let submitButton = $("#submit-button");
const key = "8082a0eacc4e1bbc29b1dd51ac82e102";
let cityNameInputVal = "";

function getInput() {
  cityNameInputVal = cityInputEl.val();
  return cityNameInputVal;
}

function getCityCoordinates(cityName) {
  let endpoint = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=${key}`;
  return fetch(endpoint)
    .then(function (response) {
      if (response.ok) {
        return response.json().then(function (data) {
          const lat = data[0].lat;
          const lon = data[0].lon;
          const result = {
            lat: lat,
            lon: lon,
          };
          console.log(
            `From getCityCoordinates, line 23: \nLat: ${result.lat}, Lon: ${result.lon}`
          );
          return result;
        });
      } else {
        throw new Error(`Error:${response.statusText}`);
      }
    })
    .catch(function (error) {
      alert("Unable to connect to OpenWeather API");
      throw error; // rethrowing the error for further handling if necessary
    });
}

function getDailyForecast(cityName) {
  getCityCoordinates(cityName)
    .then(function (coordinates) {
      const endpoint =
        "https://api.openweathermap.org/data/2.5/weather?lat=" +
        coordinates.lat +
        "&lon=" +
        coordinates.lon +
        "&appid=" +
        key +
        "&units=imperial";
      return fetch(endpoint);
    })
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          console.log(`From getDailyForecast, line 45: ${data}`);
          console.log(
            `From getDailyForecast, line 47:\nTemp: ${data.main.temp}°F\nWind: ${data.wind.speed} MPH\nHumidity: ${data.main.humidity}%\nhttp://openweathermap.org/img/w/${data.weather[0].icon}.png`
          );
          let currentDate = new Date(data.dt * 1000);
          currentDate = `${currentDate.getMonth()}/${currentDate.getDate()}/${currentDate.getFullYear()}`;
          $("#city-date").text(`${cityNameInputVal} (${currentDate})`);
          $("#daily-temp").text(`Temp: ${data.main.temp}`);
          $("#daily-wind").text(`Wind: ${data.wind.speed}`);
          $("#daily-humidity").text(`Wind: ${data.main.humidity}`);
          $("#daily-icon").attr(
            "src",
            `http://openweathermap.org/img/w/${data.weather[0].icon}.png`
          );
        });
      } else {
        alert(`Error:${response.statusText}`);
      }
    })
    .catch(function (err) {
      alert(`Unable to connect to OpenWeather API: ${error}`);
    });
}

function getFiveDayForecast(lat, lon) {}

$(document).ready(function () {
  submitButton.on("click", function (event) {
    event.preventDefault();
    const cityName = getInput();
    getDailyForecast(cityName);
  });
});
