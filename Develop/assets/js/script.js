const cityInputEl = $("#city-input");
const submitButtonEl = $("#submit-button");
const searchDivEl = $("#search-div");
const key = "8082a0eacc4e1bbc29b1dd51ac82e102";
const fiveDayResultsEl = $("#five-day-results-container");
let cityNameInputVal = "";

function getInput() {
  cityNameInputVal = cityInputEl.val();
  const searches = JSON.parse(localStorage.getItem("searches")) || [];

  searches.push(cityNameInputVal);
  localStorage.setItem("searches", JSON.stringify(searches));

  if (searches.length > 0) {
    renderSearches(searches);
  }

  return cityNameInputVal;
}

function renderSearches(searches) {
  searchDivEl.find("p").remove();
  for (let i = searches.length - 1; i >= 0; i--) {
    searchDivEl.append(
      `<p class="border border-secondary rounded p-2 search-history">${searches[i]}</p>`
    );
  }
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
          currentDate = `${
            currentDate.getMonth() + 1
          }/${currentDate.getDate()}/${currentDate.getFullYear()}`;
          $("#city-date").text(`${cityNameInputVal} (${currentDate})`);
          $("#daily-temp").text(`Temp: ${data.main.temp}°F`);
          $("#daily-wind").text(`Wind: ${data.wind.speed}mph`);
          $("#daily-humidity").text(`Humidity: ${data.main.humidity}%`);
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
      fiveDayResultsEl.empty();
      for (let i = 0; i < forecastArray.length; i++) {
        const forecastEl = `
        <div class="col-md-2 bg-info bg-gradient">
          <h3>${forecastArray[i].date}</h3>
          <img src="http://openweathermap.org/img/w/${forecastArray[i].weatherIcon}.png" />
          <p><strong>High:</strong> ${forecastArray[i].highTemp}°F</p>
          <p><strong>Low:</strong> ${forecastArray[i].lowTemp}°F</p>
          <p><strong>Humidity:</strong> ${forecastArray[i].humidity}%</p>
        </div>        
        `;

        // const parentEl = $("#next-date-" + (i + 1));
        fiveDayResultsEl.append(forecastEl);
      }
    })
    .catch(function (err) {
      alert(`Unable to connect to OpenWeather API: ${err}`);
    });
}

$(document).ready(function () {
  localStorage.setItem("searches", JSON.stringify([]));
  submitButtonEl.on("click", function (event) {
    event.preventDefault();
    const cityName = getInput();
    getDailyForecast(cityName);
    getFiveDayForecast(cityName);
  });
});
