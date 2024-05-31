async function getCoordinates(
    cityName,
    apiKey = "9d8e8a4aefa14bf18523a9d8d92f13ed"
) {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${cityName}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.results.length > 0) {
        const coordinates = data.results[0].geometry;
        const components = data.results[0].components;
        return {
            lat: coordinates.lat,
            lon: coordinates.lng,
            city:
                components.city ||
                components.town ||
                components.village ||
                cityName,
            state: components.state || "",
        };
    } else {
        throw new Error("City not found");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("city-input");
    const searchButton = document.getElementById("search-button");
    const weatherIcon = document.querySelector(".weather-image img");
    const weather = document.querySelector(".weather");
    const errorText = document.querySelector(".error");
    const card = document.querySelector(".card");

    async function checkWeather(city) {
        try {
            const geo = await getCoordinates(city);
            const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lon}&hourly=temperature_2m,relative_humidity_2m,rain,showers,snowfall,weather_code,visibility,wind_speed_10m`;
            const forecastResponse = await fetch(forecastUrl);
            const data = await forecastResponse.json();
            console.log("Forcast Data:", data);

            document.querySelector(".card").style.display = "block";

            document.querySelector(".city").innerHTML = `${geo.city}`;
            document.querySelector(".state").innerHTML = `${geo.state}`;

            document.querySelector(".temp").innerHTML =
                Math.round(data.hourly.temperature_2m[0]) + "°C";
            document.querySelector(".humidity").innerHTML =
                "Humidity: " + data.hourly.relative_humidity_2m[0] + "%";
            document.querySelector(".wind").innerHTML =
                "Wind: " + data.hourly.wind_speed_10m[0] + " m/s";

            const weatherCode = data.hourly.weather_code[0];
            console.log("Weather Code:", weatherCode);

            if (weatherCode === 0) {
                weatherIcon.src = "../img/sunny.jpeg";
            } else if (weatherCode >= 1 && weatherCode <= 3) {
                weatherIcon.src = "../img/cloud.jpeg";
            } else if (weatherCode >= 45 && weatherCode <= 48) {
                weatherIcon.src = "../img/mist.jpeg";
            } else if (weatherCode >= 51 && weatherCode <= 67) {
                weatherIcon.src = "../img/rainy.jpeg";
            } else if (weatherCode >= 71 && weatherCode <= 77) {
                weatherIcon.src = "../img/snow.jpeg";
            } else if (weatherCode >= 80 && weatherCode <= 82) {
                weatherIcon.src = "../img/shower.jpeg";
            } else {
                weatherIcon.src = "../img/weather.jpeg";
            }

            weather.style.display = "block";
            errorText.style.display = "none";
        } catch (error) {
            console.error("Error:", error);
            errorText.textContent = error.message;
            errorText.style.display = "block";
            weather.style.display = "none";
            card.style.display = "none";
        }
    }
    console.log(weatherIcon.src);

    searchButton.addEventListener("click", () => {
        checkWeather(searchInput.value);
        searchInput.value = "";
    });

    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            checkWeather(searchInput.value);
            searchInput.value = "";
        }
    });

    const footer = document.createElement("footer");
    let today = new Date();
    let thisYear = today.getFullYear();
    let copyright = document.createElement("p");
    copyright.append(`Copyright Anna Bazileeva © ${thisYear}`);
    footer.appendChild(copyright);
    document.body.appendChild(footer);
});
