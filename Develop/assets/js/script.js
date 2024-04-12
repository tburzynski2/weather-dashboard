let cityInputEl = $("#city-input");
let submitButton = $("#submit-button");
const key = "8082a0eacc4e1bbc29b1dd51ac82e102";
let cityNameInputVal = "";

function getInput() {
  cityNameInputVal = cityInputEl.val();
  return cityNameInputVal;
}

function getCityLocation(cityName) {
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
          console.log(result);
          return result;
        });
      } else {
        throw new Error(`Error:${response.statusText}`);
      }
    })
    .then(function (location) {
      return getDailyForecast(location.lat, location.lon);
    })
    .catch(function (error) {
      alert("Unable to connect to OpenWeather API");
      throw error; // rethrowing the error for further handling if necessary
    });
}

function getDailyForecast(lat, lon) {
  const endpoint = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=imperial`;
  fetch(endpoint)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          console.log(data);
          console.log(
            `Temp: ${data.main.temp}°F\nWind: ${data.wind.speed} MPH\nHumidity: ${data.main.humidity}%\nhttp://openweathermap.org/img/w/${data.weather[0].icon}.png`
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
    .catch(function (error) {
      alert("Unable to connect to OpenWeather API");
    });
}

function getFiveDayForecast(lat, lon) {}

$(document).ready(function () {
  submitButton.on("click", function (event) {
    event.preventDefault();
    const cityName = getInput();
    const geoLocation = getCityLocation(cityName);
  });
});
