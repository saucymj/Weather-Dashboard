var APIkey = "ff9ecb67200c9ef4e329bce499d60466";
var currentCity = "";
var lastCity = "";


var getCurrentConditions = (event) => {
    var city = $('#search-city').val();
    currentCity= $('#search-city').val();
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "&APPID=" + APIkey;
    fetch(queryURL)
    .then((response) => {
        return response.json();
    })
    .then((response) => {
        saveCity(city);
        $('#search-error').text("");
        var currentWeatherIcon="https://openweathermap.org/img/w/" + response.weather[0].icon + ".png";
        var currentTimeUTC = response.dt;
        var currentTimeZoneOffset = response.timezone;
        var currentTimeZoneOffsetHours = currentTimeZoneOffset / 60 / 60;
        var currentMoment = moment.unix(currentTimeUTC).utc().utcOffset(currentTimeZoneOffsetHours);
        renderCities();
        getFiveDayForecast(event);
        $('#header-text').text(response.name);
        var currentWeatherHTML = `
            <h3>${response.name} ${currentMoment.format("(MM/DD/YY)")}<img src="${currentWeatherIcon}"></h3>
            <ul class="list-unstyled">
                <li>Temperature: ${response.main.temp}&#8457;</li>
                <li>Humidity: ${response.main.humidity}%</li>
                <li>Wind Speed: ${response.wind.speed} mph</li>
                <li id="uvIndex">UV Index:</li>
            </ul>`;
        $('#current-weather').html(currentWeatherHTML);
        var latitude = response.coord.lat;
        var longitude = response.coord.lon;
        var uvQueryURL = "api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&APPID=" + APIkey;
        uvQueryURL = "https://cors-anywhere.herokuapp.com/" + uvQueryURL;
        fetch(uvQueryURL)

        .then((response) => {
            return response.json();
        })
        .then((response) => {
            var uvIndex = response.value;
            $('#uvIndex').html(`UV Index: <span id="uvVal"> ${uvIndex}</span>`);
            if (uvIndex>=0 && uvIndex<3){
                $('#uvVal').attr("class", "uv-favorable");
            } else if (uvIndex>=3 && uvIndex<8){
                $('#uvVal').attr("class", "uv-moderate");
            } else if (uvIndex>=8){
                $('#uvVal').attr("class", "uv-severe");
            }
        });
    })
}

var getFiveDayForecast = (event) => {
    var city = $('#search-city').val();
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial" + "&APPID=" + APIkey;
    fetch(queryURL)
        .then((response) => {
            return response.json();
        })
        .then((response) => {
        var fiveDayForecastHTML = `
        <h2>5-Day Forecast:</h2>
        <div id="fiveDayForecastUl" class="d-inline-flex flex-wrap ">`;
        for (var i = 0; i < response.list.length; i++) {
            var dayData = response.list[i];
            var dayTimeUTC = dayData.dt;
            var timeZoneOffset = response.city.timezone;
            var timeZoneOffsetHours = timeZoneOffset / 60 / 60;
            var thisMoment = moment.unix(dayTimeUTC).utc().utcOffset(timeZoneOffsetHours);
            var iconURL = "https://openweathermap.org/img/w/" + dayData.weather[0].icon + ".png";
            if (thisMoment.format("HH:mm:ss") === "11:00:00" || thisMoment.format("HH:mm:ss") === "12:00:00" || thisMoment.format("HH:mm:ss") === "13:00:00") {
                fiveDayForecastHTML += `
                <div class="weather-card bg-info text-white card m-2 p0">
                    <ul class="list-unstyled p-3">
                        <li>${thisMoment.format("MM/DD/YY")}</li>
                        <li class="weather-icon"><img src="${iconURL}"></li>
                        <li>Temp: ${dayData.main.temp}&#8457;</li>
                        <br>
                        <li>Humidity: ${dayData.main.humidity}%</li>
                    </ul>
                </div>`;
            }
        }
        fiveDayForecastHTML += `</div>`;
        $('#five-day-forecast').html(fiveDayForecastHTML);
    })
}

var saveCity = (newCity) => {
    var cityExists = false;
    for (var i = 0; i < localStorage.length; i++) {
        if (localStorage["cities" + i] === newCity) {
            cityExists = true;
            break;
        }
    }
    if (cityExists === false) {
        localStorage.setItem('cities' + localStorage.length, newCity);
    }
}

var renderCities = () => {
    $('#city-results').empty();
    if (localStorage.length===0){
        if (lastCity){
            $('#search-city').attr("value", lastCity);
        } else {
            $('#search-city').attr("value", "Chicago");
        }
    } else {
        var lastCityKey="cities"+(localStorage.length-1);
        lastCity=localStorage.getItem(lastCityKey);
        $('#search-city').attr("value", lastCity);
        for (var i = 0; i < localStorage.length; i++) {
            var city = localStorage.getItem("cities" + i);
            var cityEl;
            if (currentCity===""){
                currentCity=lastCity;
            }
            if (city === currentCity) {
                cityEl = `<button type="button" class="list-group-item list-group-item-action active">${city}</button></li>`;
            } else {
                cityEl = `<button type="button" class="list-group-item list-group-item-action">${city}</button></li>`;
            } 
            $('#city-results').prepend(cityEl);
        }
        if (localStorage.length>0){
            $('#clear-storage').html($('<a id="clear-storage" href="#">clear</a>'));
        } else {
            $('#clear-storage').html('');
        }
    }
    
}

$('#search-button').on("click", (event) => {
event.preventDefault();
currentCity = $('#search-city').val();
getCurrentConditions(event);
});

$('#city-results').on("click", (event) => {
    event.preventDefault();
    $('#search-city').val(event.target.textContent);
    currentCity=$('#search-city').val();
    getCurrentConditions(event);
});

$("#clear-storage").on("click", (event) => {
    localStorage.clear();
    renderCities();
});

renderCities();

getCurrentConditions();