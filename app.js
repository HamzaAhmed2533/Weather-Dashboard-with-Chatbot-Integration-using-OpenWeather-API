const API_KEY = 'bf90f43798142d842f321dec3c5ef4ee';
const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEMINI_API_KEY = 'AIzaSyCJoBQgh9VhwuCNjKwmFLvnxe2VkTYQAVk';

const currentWeatherEl = document.getElementById('current-weather');
const forecastTableEl = document.getElementById('forecast-table');
const paginationEl = document.getElementById('pagination');
const cityInputEl = document.getElementById('city-input');
const unitToggleEl = document.getElementById('unit-toggle');
const chatMessagesEl = document.getElementById('chat-messages');
const chatFormEl = document.getElementById('chat-form');
const chatInputEl = document.getElementById('chat-input');
const loadingIndicatorEl = document.getElementById('loading-indicator');
const darkModeToggleEl = document.getElementById('dark-mode-toggle');
const geolocationButtonEl = document.getElementById('geolocation-button');

let forecastData = [];
let currentUnit = 'metric';
let currentCity = '';
let currentPage = 1;
const itemsPerPage = 10;

let temperatureChart, conditionsChart, temperatureLineChart;

async function getWeatherData(city) {
    try {
        const currentWeatherResponse = await fetch(`${WEATHER_API_BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=${currentUnit}`);
        const forecastResponse = await  fetch(`${WEATHER_API_BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=${currentUnit}`);

        if (!currentWeatherResponse.ok || !forecastResponse.ok) {
            throw new Error('City not found');
        }

        const currentWeatherData = await currentWeatherResponse.json();
        const forecastData = await forecastResponse.json();

        return { currentWeatherData, forecastData };
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
}

async function getWeatherDataByCoords(lat, lon) {
    try {
        const currentWeatherResponse = await fetch(`${WEATHER_API_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`);
        const forecastResponse = await fetch(`${WEATHER_API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`);

        if (!currentWeatherResponse.ok || !forecastResponse.ok) {
            throw new Error('Unable to fetch weather data');
        }

        const currentWeatherData = await currentWeatherResponse.json();
        const forecastData = await forecastResponse.json();

        return { currentWeatherData, forecastData };
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
}

function displayCurrentWeather(data) {
    const { name, main, weather, wind } = data;
    const tempUnit = currentUnit === 'metric' ? '°C' : '°F';
    const windUnit = currentUnit === 'metric' ? 'm/s' : 'mph';
    currentWeatherEl.innerHTML = `
        <h3>${name}</h3>
        <p><strong>Temperature:</strong> ${main.temp.toFixed(1)}${tempUnit}</p>
        <p><strong>Feels like:</strong> ${main.feels_like.toFixed(1)}${tempUnit}</p>
        <p><strong>Humidity:</strong> ${main.humidity}%</p>
        <p><strong>Wind speed:</strong> ${wind.speed.toFixed(1)} ${windUnit}</p>
        <p><strong>Weather:</strong> ${weather[0].description}</p>
        <img src="http://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="${weather[0].description}">
    `;
}

function displayForecast(data) {
    forecastData = data.list;
    displayForecastPage(1);
}

function displayForecastPage(page) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = forecastData.slice(start, end);

    const tempUnit = currentUnit === 'metric' ? '°C' : '°F';
    let tableHTML = `
        <tr>
            <th>Date & Time</th>
            <th>Temperature</th>
            <th>Weather</th>
        </tr>
    `;

    pageData.forEach(item => {
        const date = new Date(item.dt * 1000);
        tableHTML += `
            <tr>
                <td>${date.toLocaleString()}</td>
                <td>${item.main.temp.toFixed(1)}${tempUnit}</td>
                <td>${item.weather[0].description}</td>
            </tr>
        `;
    });

    forecastTableEl.innerHTML = tableHTML;

    const totalPages = Math.ceil(forecastData.length / itemsPerPage);
    let paginationHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `<button onclick="changePage(${i})" ${i === page ? 'class="active"' : ''}>${i}</button>`;
    }
    paginationEl.innerHTML = paginationHTML;
    currentPage = page;
}

function changePage(page) {
    displayForecastPage(page);
}

function createTemperatureChart(data) {
    const ctx = document.getElementById('temperature-chart').getContext('2d');
    if (temperatureChart) {
        temperatureChart.destroy();
    }
    const labels = data.map(item => new Date(item.dt * 1000).toLocaleDateString());
    const temperatures = data.map(item => item.main.temp);

    temperatureChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `Temperature (${currentUnit === 'metric' ? '°C' : '°F'})`,
                data: temperatures,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false
                }
            },
            animation: {
                delay: 500
            }
        }
    });
}

function createWeatherConditionsChart(data) {
    const ctx = document.getElementById('conditions-chart').getContext('2d');
    if (conditionsChart) {
        conditionsChart.destroy();
    }
    const conditions = data.map(item => item.weather[0].main);
    const conditionCounts = conditions.reduce((acc, condition) => {
        acc[condition] = (acc[condition] || 0) + 1;
        return acc;
    }, {});

    conditionsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(conditionCounts),
            datasets: [{
                data: Object.values(conditionCounts),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            animation: {
                delay: 500
            }
        }
    });
}

function createTemperatureLineChart(data) {
    const ctx = document.getElementById('temperature-line-chart').getContext('2d');
    if (temperatureLineChart) {
        temperatureLineChart.destroy();
    }
    const labels = data.map(item => new Date(item.dt * 1000).toLocaleDateString());
    const temperatures = data.map(item => item.main.temp);

    temperatureLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Temperature (${currentUnit === 'metric' ? '°C' : '°F'})`,
                data: temperatures,
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutBounce'
            }
        }
    });
}

async function updateWeatherDashboard(city) {
    try {
        loadingIndicatorEl.style.display = 'flex';
        const { currentWeatherData, forecastData } = await getWeatherData(city);
        currentCity = city;
        displayCurrentWeather(currentWeatherData);
        displayForecast(forecastData);
        createTemperatureChart(forecastData.list.filter((item, index) => index % 8 === 0));
        createWeatherConditionsChart(forecastData.list.filter((item, index) => index % 8 === 0));
        createTemperatureLineChart(forecastData.list.filter((item, index) => index % 8 === 0));
    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        loadingIndicatorEl.style.display = 'none';
    }
}

function handleGeolocation() {
    if ("geolocation" in navigator) {
        loadingIndicatorEl.style.display = 'flex';
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const { currentWeatherData, forecastData } = await getWeatherDataByCoords(latitude, longitude);
                currentCity = currentWeatherData.name;
                displayCurrentWeather(currentWeatherData);
                displayForecast(forecastData);
                createTemperatureChart(forecastData.list.filter((item, index) => index % 8 === 0));
                createWeatherConditionsChart(forecastData.list.filter((item, index) => index % 8 === 0));
                createTemperatureLineChart(forecastData.list.filter((item, index) => index % 8 === 0));
            } catch (error) {
                alert('Error: ' + error.message);
            } finally {
                loadingIndicatorEl.style.display = 'none';
            }
        }, (error) => {
            alert('Error: ' + error.message);
            loadingIndicatorEl.style.display = 'none';
        });
    } else {
        alert("Geolocation is not supported by your browser");
    }
}


function toggleUnit() {
    currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
    unitToggleEl.textContent = currentUnit === 'metric' ? 'Switch to °F' : 'Switch to °C';
    updateWeatherDashboard(currentCity);
}

function addChatMessage(message, isUser = false) {
    const messageEl = document.createElement('div');
    messageEl.classList.add('chat-message', isUser ? 'user-message' : 'bot-message');
    messageEl.textContent = message;
    chatMessagesEl.appendChild(messageEl);
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

function isWeatherRelatedQuery(query) {
    const weatherKeywords = ['weather', 'temperature', 'humidity', 'wind', 'forecast', 'rain', 'snow', 'sunny', 'cloudy', 'storm', 'highest', 'lowest', 'average'];
    return weatherKeywords.some(keyword => query.toLowerCase().includes(keyword));
}

async function getWeatherChatResponse(message) {
    if (!currentCity) {
        return "I'm sorry, but I don't have any weather information at the moment. Please search for a city first.";
    }

    const lowercaseMessage = message.toLowerCase();
    
    if (lowercaseMessage.includes('tomorrow')) {
        const tomorrowForecast = forecastData.find(item => {
            const itemDate = new Date(item.dt * 1000);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return itemDate.getDate() === tomorrow.getDate();
        });

        if (tomorrowForecast) {
            return `The weather forecast for tomorrow in ${currentCity} is ${tomorrowForecast.weather[0].description} with a temperature of ${tomorrowForecast.main.temp.toFixed(1)}°${currentUnit === 'metric' ? 'C' : 'F'}.`;
        } else {
            return `I'm sorry, I don't have forecast data for tomorrow in ${currentCity}.`;
        }
    }

    if (lowercaseMessage.includes('london') && currentCity.toLowerCase() !== 'london') {
        return `To check the weather in London, please use the search bar to change the current city to London. Currently, I have weather information for ${currentCity}.`;
    }

    if (lowercaseMessage.includes('temperature')) {
        return `The current temperature in ${currentCity} is ${currentWeatherEl.querySelector('p').textContent}`;
    } else if (lowercaseMessage.includes('humidity')) {
        return `The current humidity in ${currentCity} is ${currentWeatherEl.querySelectorAll('p')[2].textContent}`;
    } else if (lowercaseMessage.includes('weather')) {
        return `The current weather in ${currentCity} is ${currentWeatherEl.querySelectorAll('p')[4].textContent}`;
    } else {
        return `I'm sorry, I couldn't understand your weather-related question. You can ask about temperature, humidity, or general weather conditions in ${currentCity}. You can also ask about tomorrow's weather.`;
    }
}

async function getGeminiResponse(message) {
    const weatherAssistantContext = `You are a weather assistant chatbot integrated into a weather dashboard application. Your primary function is to answer weather-related queries, but you can also engage in general conversation. When asked about your identity or capabilities, explain that you are a weather assistant chatbot that can provide weather information and answer general questions. If asked about non-weather topics, politely inform the user that while you can discuss various topics, your main purpose is to assist with weather-related information. Always maintain a helpful and friendly tone. The current city for weather information is ${currentCity}.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${weatherAssistantContext}\n\nUser: ${message}\nAssistant:`
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get response from Gemini API');
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return "I'm sorry, I couldn't process your request at the moment. Please try again later.";
    }
}

async function handleChatSubmit(e) {
    e.preventDefault();
    const userInput = chatInputEl.value.trim();
    if (userInput) {
        addChatMessage(userInput, true);
        chatInputEl.value = '';
        
        let botResponse;
        if (isWeatherRelatedQuery(userInput)) {
            botResponse = await getWeatherChatResponse(userInput);
        } else {
            botResponse = await getGeminiResponse(userInput);
        }
        
        addChatMessage(botResponse);
    }
}

function switchPage(pageName) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(`${pageName}-page`).classList.add('active');
    document.querySelectorAll('nav a').forEach(link => link.classList.remove('active'));
    document.querySelector(`nav a[data-page="${pageName}"]`).classList.add('active');
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    darkModeToggleEl.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌓';
}

cityInputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        updateWeatherDashboard(cityInputEl.value);
    }
});

unitToggleEl.addEventListener('click', toggleUnit);
chatFormEl.addEventListener('submit', handleChatSubmit);
darkModeToggleEl.addEventListener('click', toggleDarkMode);
geolocationButtonEl.addEventListener('click', handleGeolocation);

document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        switchPage(e.target.dataset.page);
    });
});

if ("geolocation" in navigator) {
    handleGeolocation();
} else {
    updateWeatherDashboard('Pakistan');
}
switchPage('dashboard');
