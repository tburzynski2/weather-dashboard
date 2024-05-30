// Selectors
const cityInputEl = $("#city-input");
const submitButtonEl = $("#submit-button");
const searchDivEl = $("#search-div");
const fiveDayResultsEl = $("#five-day-results-container");

// API Key
const key = "8082a0eacc4e1bbc29b1dd51ac82e102";

// Get input from text field and update search history
function getInput() {
  const cityName = cityInputEl.val();
  updateSearchHistory(cityName);
  return cityName;
}

// Save search history to browser local storage
function updateSearchHistory(cityName) {
  let searches = JSON.parse(localStorage.getItem("searches")) || [];
  searches.push(cityName);
  localStorage.setItem("searches", JSON.stringify(searches));
  renderSearches(searches);
}

// Render updated search history to page
function renderSearches(searches) {
  searchDivEl.find("p").remove();
  for (let i = searches.length - 1; i >= 0; i--) {
    searchDivEl.append(
      `<p class="border border-secondary rounded p-2 search-history">${searches[i]}</p>`
    );
  }
}

// Listen for clicks on the search history <p> elements
searchDivEl.on("click", "p", function () {
  searchDivEl.find("p").removeClass("selected-history");
  $(this).addClass("selected-history");
  const cityName = $(this).text();
  getDailyForecast(cityName);
  getFiveDayForecast(cityName);
});

// Get city lat and lon attributes from OpenWeather API
function getCityCoordinates(cityName) {
  const endpoint = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=${key}`;
  return fetch(endpoint)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      const lat = data[0].lat;
      const lon = data[0].lon;
      const result = {
        lat: lat,
        lon: lon,
      };
      return result;
    })
    .catch((error) => {
      alert("Unable to connect to OpenWeather API");
      throw error;
    });
}

// Get daily weather forecast data
function getDailyForecast(cityName) {
  return getCityCoordinates(cityName)
    .then((coordinates) => {
      const endpoint = `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${key}&units=imperial`;
      return fetch(endpoint);
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      displayCurrentWeather(data, cityName);
    })
    .catch((error) => {
      console.error("Error getting daily forecast:", error);
    });
}

// Get five-day forecast data
function getFiveDayForecast(cityName) {
  return getCityCoordinates(cityName)
    .then((coordinates) => {
      const endpoint = `https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${key}&units=imperial`;
      return fetch(endpoint);
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      return response.json();
    })
    .then((forecastData) => {
      const fiveDayForecastArray = processFiveDayForecast(forecastData.list);
      displayFiveDayForecast(fiveDayForecastArray);
    })
    .catch((error) => {
      console.error("Error getting five-day forecast:", error);
    });
}

// Display daily weather data
function displayCurrentWeather(data, cityName) {
  const currentDate = new Date(data.dt * 1000);
  const formattedDate = `${
    currentDate.getMonth() + 1
  }/${currentDate.getDate()}/${currentDate.getFullYear()}`;
  $("#city-date").text(`${cityName} (${formattedDate})`);
  $("#daily-temp").text(`Temp: ${data.main.temp}°F`);
  $("#daily-wind").text(`Wind: ${data.wind.speed} MPH`);
  $("#daily-humidity").text(`Humidity: ${data.main.humidity}%`);
  $("#daily-icon").attr(
    "src",
    `http://openweathermap.org/img/w/${data.weather[0].icon}.png`
  );
}

// Create an array of objects holding the 5-day forecast weather data
// Push a new object only if the date has changed
// Update daily high/lows if a higher/lower temp is found
function processFiveDayForecast(forecastData) {
  const fiveDayForecastArray = [];
  forecastData.forEach((forecastEntry) => {
    const dateTime = forecastEntry.dt_txt;
    const date = dateTime.split(" ")[0];
    const existingForecast = fiveDayForecastArray.find(
      (entry) => entry.date === date
    );
    if (!existingForecast) {
      fiveDayForecastArray.push({
        date,
        weatherIcon: forecastEntry.weather[0].icon,
        highTemp: forecastEntry.main.temp_max,
        lowTemp: forecastEntry.main.temp_min,
        windSpeed: forecastEntry.wind.speed,
        humidity: forecastEntry.main.humidity,
      });
    } else {
      if (forecastEntry.main.temp_max > existingForecast.highTemp) {
        existingForecast.highTemp = forecastEntry.main.temp_max;
      }
      if (forecastEntry.main.temp_min < existingForecast.lowTemp) {
        existingForecast.lowTemp = forecastEntry.main.temp_min;
      }
    }
  });
  return fiveDayForecastArray;
}

// Create five-day forecast elements & append to container
function displayFiveDayForecast(forecastArray) {
  fiveDayResultsEl.empty();
  for (let i = 0; i < forecastArray.length; i++) {
    const forecastEl = `
      <div class="col-md-2 bg-info bg-gradient">
        <h3>${forecastArray[i].date}</h3>
        <img src="http://openweathermap.org/img/w/${forecastArray[i].weatherIcon}.png" />
        <p><strong>High:</strong> ${forecastArray[i].highTemp}°F</p>
        <p><strong>Low:</strong> ${forecastArray[i].lowTemp}°F</p>
        <p><strong>Wind:</strong> ${forecastArray[i].windSpeed} MPH</p>
        <p><strong>Humidity:</strong> ${forecastArray[i].humidity}%</p>
      </div>        
    `;
    fiveDayResultsEl.append(forecastEl);
  }
}

// Document ready function
$(document).ready(function () {
  localStorage.setItem("searches", JSON.stringify([]));
  submitButtonEl.on("click", function (event) {
    event.preventDefault();
    const cityName = getInput();
    getDailyForecast(cityName);
    getFiveDayForecast(cityName);
  });
});
