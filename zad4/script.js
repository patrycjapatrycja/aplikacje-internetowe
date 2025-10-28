// https://api.openweathermap.org/data/2.5/forecast?q=szczecin&appid=7ded80d91f2b280ec979100cc8bbba94&units=metric


window.onload = function () {
    const getWeatherButton = document.getElementById("get-weather-button");
    const cityInput = document.getElementById("city-input");


    getWeatherButton.addEventListener('click', () => {
        const city = cityInput.value;
        getWeatherJsonData(city);
    });
};
const getWeatherJsonData = function (city) {
    const baseUrl =  "https://api.openweathermap.org/data/2.5/forecast?units=metric&lang=pl";
    const apiKey = "7ded80d91f2b280ec979100cc8bbba94";
    const url = baseUrl + `&appid=${apiKey}&q=${city.toLowerCase()}`;

    const weatherResultsContainer = document.getElementById("weather-results-container");
    weatherResultsContainer.innerHTML = ``;

    fetch(url)
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            const weatherData = data.list;
            handleWeatherData(weatherData);

            const cityName = document.getElementById("city-name");
            cityName.textContent = `Pogoda dla ${city}`;
        })
        .catch((error) => {
           console.log(`fetch error: ${error}`);
        });

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