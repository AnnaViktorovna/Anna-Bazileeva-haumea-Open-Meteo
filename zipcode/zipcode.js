async function getCoordinates(zipCode, countryCode = "us") {
    const url = `https://api.zippopotam.us/${countryCode}/${zipCode}`;
    console.log(`Fetching coordinates from URL: ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("Zipcode not found");
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    }

    const data = await response.json();
    console.log("Response data:", data);

    if (data.places && data.places.length > 0) {
        const place = data.places[0];
        return {
            lat: parseFloat(place.latitude),
            lon: parseFloat(place.longitude),
            zipcode: zipCode,
            country: countryCode,
        };
    } else {
        throw new Error("Location not found");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("zipcode-input");
    const searchButton = document.getElementById("search-button");
    const weatherIcon = document.querySelector(".weather-image img");
    const weather = document.querySelector(".weather");
    const errorText = document.querySelector(".error");
    const card = document.querySelector(".card")

    async function checkWeather(zipCode) {
        try {
            const geo = await getCoordinates(zipCode);
            const apiKey = "20240526230954";
            const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lon}&hourly=temperature_2m,relative_humidity_2m,rain,showers,snowfall,weather_code,visibility,wind_speed_10m`;
            const forecastResponse = await fetch(forecastUrl);

            if (!forecastResponse.ok) {
                throw new Error(
                    `HTTP error! status: ${forecastResponse.status}`
                );
            }

            const data = await forecastResponse.json();
            console.log("Forecast Data:", data);

            document.querySelector(".card").style.display = "block";

            document.querySelector(".zipcode").innerHTML = `${geo.zipcode}`;
            const stateElement = document.querySelector(".state");
            stateElement.innerHTML = `${geo.country}`;
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
            console.log(weatherIcon.src);

            weather.style.display = "block";
            errorText.style.display = "none";
        } catch (error) {
            console.error("Error:", error);
            if (error.message === "Zipcode not found") {
                errorText.textContent = "Zipcode not found";
            } else {
                errorText.textContent = error.message;
            }
            errorText.style.display = "block";
            weather.style.display = "none";
            card.style.display = "none"
        }
    }

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
