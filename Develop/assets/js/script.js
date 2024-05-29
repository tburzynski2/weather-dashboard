let cityInputEl = $("#city-input");
let submitButton = $("#submit-button");
const key = "8082a0eacc4e1bbc29b1dd51ac82e102";
let cityNameInputVal = "";

function getInput() {
  const cityNameInputVal = cityInputEl.val();
  const searches = JSON.parse(localStorage.getItem("searches")) || [];

  searches.push(cityNameInputVal);
  localStorage.setItem("searches", JSON.stringify(searches));

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
      alert(`Unable to connect to OpenWeather API: ${err}`);
    });
}

function getFiveDayForecast(cityName) {
  getCityCoordinates(cityName)
    .then(function (coordinates) {
      // Get 5-day forecast
      const endpoint =
        "https://api.openweathermap.org/data/2.5/forecast?lat=" +
        coordinates.lat +
        "&lon=" +
        coordinates.lon +
        "&appid=" +
        key +
        "&units=imperial";
      return fetch(endpoint);
    })
    .then(function (forecastResponse) {
      if (forecastResponse.ok) {
        return forecastResponse.json();
      } else {
        alert(`Error: ${forecastResponse.statusText}`);
      }
    })
    .then(function (forecastResults) {
      const forecastData = forecastResults.list;
      const fiveDayForecastArray = [];

      forecastData.forEach(function (forecastEntry) {
        const dateTime = forecastEntry.dt_txt;
        const date = dateTime.split(" ")[0];
        const weatherIcon = forecastEntry.weather[0].icon;
        const highTemp = forecastEntry.main.temp_max;
        const lowTemp = forecastEntry.main.temp_min;
        const humidity = forecastEntry.main.humidity;

        // Check if this date already exists in the forecast array
        const existingForecast = fiveDayForecastArray.find(
          (entry) => entry.date === date
        );

        if (!existingForecast) {
          // If the date doesn't exist, create a new forecast object
          const forecastObject = {
            date: date,
            weatherIcon: weatherIcon,
            highTemp: highTemp,
            lowTemp: lowTemp,
            humidity: humidity,
          };
          fiveDayForecastArray.push(forecastObject);
        } else {
          // If the date already exists, update the high and low temperatures if necessary
          if (highTemp > existingForecast.highTemp) {
            existingForecast.highTemp = highTemp;
          }
          if (lowTemp < existingForecast.lowTemp) {
            existingForecast.lowTemp = lowTemp;
          }
        }
      });

      console.log("Five-day forecast:", fiveDayForecastArray);
      return fiveDayForecastArray;
    })
    .then(function (forecastArray) {
      for (let i = 0; i < forecastArray.length; i++) {
        const forecastEl = `
        <h2>${forecastArray[i].date}</h2>
        <img src="http://openweathermap.org/img/w/${forecastArray[i].weatherIcon}.png" />
        <p><strong>High:</strong> ${forecastArray[i].highTemp}°F</p>
        <p><strong>Low:</strong> ${forecastArray[i].lowTemp}°F</p>
        <p><strong>Humidity:</strong> ${forecastArray[i].humidity}%</p>
        `;

        const parentEl = $("#next-date-" + (i + 1));
        parentEl.append(forecastEl);
      }
    })
    .catch(function (err) {
      alert(`Unable to connect to OpenWeather API: ${err}`);
    });
}

$(document).ready(function () {
  submitButton.on("click", function (event) {
    event.preventDefault();
    const cityName = getInput();
    getDailyForecast(cityName);
    getFiveDayForecast(cityName);
  });
});
