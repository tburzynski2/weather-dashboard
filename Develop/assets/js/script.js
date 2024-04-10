let cityInputEl = $("#city-input");
let submitButton = $("#submit-button");
const key = "8082a0eacc4e1bbc29b1dd51ac82e102";

function getCityId(cityName) {}

function getDailyForecast(cityId) {}

function getFiveDayForecast(cityId) {}

$(document).ready(function () {
  submitButton.on("click", function (event) {
    event.preventDefault();
    console.log(cityInputEl.val());
  });
});
