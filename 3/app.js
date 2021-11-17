$(document).ready(function () {
  //getting data country from api and pushing it into the list
  $.ajax({
    type: "GET",
    url: "https://restcountries.com/v2/all",
    dataType: "json",
    success: function (response) {
      let = countryList = response.sort((a, b) => a.name.localeCompare(b.name));
      addCountriesToSelectOptions(countryList);
    },
  });

  function addCountriesToSelectOptions(countryList) {
    for (let country of countryList) {
      let option = `<option value="${country.alpha2Code}">${country.name}</option>`;
      $("#countries-select-form").append(option);
    }
  }

  //submit changes when select diffrent Changes
  $("#countries-select-form").change(function () {
    let chosenOptionAlpha2CodeValue = $(this).val();
    let chosenCountry = countryList.find(
      (theCountry) => theCountry.alpha2Code === chosenOptionAlpha2CodeValue
    );
    makeCountryInfo(chosenCountry);
    getWeatherOfCapital(chosenCountry.capital);
  });

  // get the info of chosen country from api
  function makeCountryInfo(country) {
    $("#country-name").text(country.name);
    $("#native-name").text(country.nativeName);
    $("#capital").text(country.capital);
    $("#region").text(`${country.region}, ${country.subregion}`);
    $("#population").text(country.population.toLocaleString());
    $("#languages").text(country.languages[0].name);
    $("#timezones").text(country.timezones[0]);
    $("#calling-codes").text(country.callingCodes[0]);
    $("#flag-container").html(
      `<img class="w-100" src="${country.flag}" alt="">`
    );
    initMap(country.latlng[0], country.latlng[1]);
  }

  // get the weather info
  function getWeatherOfCapital(countryCapital) {
    $.ajax({
      type: "GET",
      url: `https://api.openweathermap.org/data/2.5/weather?q=${countryCapital}&appid=6c72f899c495c213d54904c546318ee6`,
      dataType: "json",
      success: function (capitalWeather) {
        $("#weather-pic").attr(
          "src",
          `http://openweathermap.org/img/wn/${capitalWeather.weather[0].icon}@2x.png`
        );
        $("#weather-description").text(capitalWeather.weather[0].main);
        $("#wind-speed").text(capitalWeather.wind.speed);
        $("#temprature").text(capitalWeather.main.temp);
        $("#humidity").text(capitalWeather.main.humidity);
        $("#visibility").text(capitalWeather.visibility);
      },
    });
  }

  // load map of country
  function initMap(inputLat, inputLng) {
    // The location of Uluru
    const location = { lat: inputLat, lng: inputLng };
    // The map, centered at location
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 4,
      center: location,
    });
    // The marker, positioned at location
    const marker = new google.maps.Marker({
      position: location,
      map: map,
    });
  }
});
