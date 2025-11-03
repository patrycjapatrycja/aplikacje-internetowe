// https://api.openweathermap.org/data/2.5/forecast?q=szczecin&appid=7ded80d91f2b280ec979100cc8bbba94&units=metric


window.onload = function () {
    const getWeatherButton = document.getElementById("get-weather-button");
    const cityInput = document.getElementById("city-input");


    getWeatherButton.addEventListener('click', () => {
        const city = cityInput.value;
        const cityName = document.getElementById("city-name");
        let cityCapitalized = city;
        switch (city.length) {
            case 0:
                break;
            case 1:
                cityCapitalized = city.toUpperCase();
                break;
            default:
                cityCapitalized = city[0].toUpperCase() + city.slice(1);
                break;
        }
        cityName.textContent = `Pogoda dla ${cityCapitalized}`;
        getWeatherData(city);
    });
};


const getWeatherData = function (city) {
    const apiKey = "7218deaeb0ffa0794e5e7fa035dc779d";
    const baseJsonUrl =  "https://api.openweathermap.org/data/2.5/forecast?units=metric&lang=pl";
    const urlJson = baseJsonUrl + `&appid=${apiKey}&q=${city.toLowerCase()}`;

    const baseXmlUrl = "https://api.openweathermap.org/data/2.5/weather?";
    const urlXml = baseXmlUrl + `appid=${apiKey}&q=${city.toLowerCase()}&units=metric&mode=xml&lang=pl`;

    getWeatherJsonData(urlJson);
    getWeatherXmlData(urlXml);
}
const getWeatherJsonData = function (url) {
    const weatherResultsContainer = document.getElementById("weather-results-container");
    weatherResultsContainer.innerHTML = ``;

    fetch(url)
        .then((response) => {
            console.log(response);
            return response.json();
        })
        .then((data) => {
            const weatherData = data.list;
            handleWeatherData(weatherData);

        })
        .catch((error) => {
           console.log(`fetch error: ${error}`);
        });

};

const getWeatherXmlData = function (url) {
    const iconBaseUrl = "https://openweathermap.org/img/wn/";
    const currentWeatherContainer = document.getElementById("current-weather-container");
    const outerContainer = document.getElementsByClassName("container")[0];
    currentWeatherContainer.innerHTML = ``;
    let request = new XMLHttpRequest();
    request.open("GET", url, true);

    request.addEventListener("load", function(e) {
        console.log("XML: \n" + request.responseText);
        try {
            const response = request.responseXML.querySelector("current");
            const temperature = response.querySelector("temperature").getAttribute("value");
            const date = response.querySelector("lastupdate").getAttribute("value").substring(0, 10);
            const day = date.substring(8,10);
            const month = date.substring(5,7);
            const humidity = response.querySelector("humidity").getAttribute("value");
            const humidityUnit = response.querySelector("humidity").getAttribute("unit");
            const weather = response.querySelector("weather").getAttribute("value");

            const icon = response.querySelector("weather").getAttribute("icon");
            const iconUrl = iconBaseUrl + icon + ".png";

            currentWeatherContainer.innerHTML = `
            <p class="date">${day}.${month}</p>
            <p class="degree">${temperature} &deg;C</p>
            <div>
                <img src="${iconUrl}" alt="">
            </div>
            <p>${weather}</p>
            </div>
            <p>wilgotność: ${humidity}${humidityUnit}</p>
            `;
            currentWeatherContainer.style.display = "flex";
            outerContainer.style.display = "flex";
        } catch (e) {
            currentWeatherContainer.style.display = "none";
            outerContainer.style.display = "none";
            console.log("xml error: " + e);
        }
    });

    request.addEventListener('error', (error) => {
        console.log("error requesting xml: " + error);
        currentWeatherContainer.style.display = "none";
    });

    request.send();
};


const handleWeatherData = function (data) {
    const weatherResultsContainer = document.getElementById("weather-results-container");

    var dayWeatherContainer;
    var row;
    const days = [];
    for (let i=0; i<data.length; i++) {
        const dayData = data[i];
        const dayItem = createWeatherItem(dayData);

        const date = dayItem[1];

        if (!days.includes(date)) {
            const month = date.slice(5,7);
            const day = date.slice(8, 10);
            days.push(date);

            dayWeatherContainer = document.createElement("div");
            dayWeatherContainer.className = "day-weather-container";

            row = document.createElement("div");
            row.className = "row";

            const dateP = document.createElement("p");
            dateP.className = "date";
            dateP.textContent = `${day}.${month}`;

            dayWeatherContainer.appendChild(dateP);
            dayWeatherContainer.appendChild(row);
            weatherResultsContainer.appendChild(dayWeatherContainer);
        }
        row.appendChild(dayItem[0]);
    }
};


const createWeatherItem = function (data) {
    const temperature = data.main.temp;
    const description = data.weather[0].description;
    const date = data["dt_txt"];
    const hour = date.slice(11, 16);

    const dayItem = document.createElement("div");
    dayItem.className = "weather-item";
    dayItem.innerHTML = `
        <p class="hour">${hour}</p>
        <p class="degree">${temperature} &deg;C</p>
        <p class="description">${description}</p>
    `;
    return [dayItem, date.slice(0, 10)];
};