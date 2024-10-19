# Weather Dashboard

A comprehensive weather dashboard application that provides current weather information, forecasts, and interactive charts for any city worldwide.

## Features

- Current Weather Display: Shows temperature, humidity, wind speed, and weather conditions for the selected city.
- 5-Day Forecast: Provides a detailed forecast for the next 5 days.
- Interactive Charts: Visualizes temperature trends and weather conditions using Chart.js.
- Unit Toggle: Switch between Celsius and Fahrenheit.
- Dark Mode: Toggle between light and dark themes for comfortable viewing.
- Responsive Design: Adapts to various screen sizes for optimal viewing on desktop and mobile devices.
- AI-Powered Chatbot: Answers weather-related queries and provides general information.

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Chart.js for data visualization
- OpenWeather API for weather data
- Gemini API for AI-powered chat responses

## Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/HamzaAhmed2533/Weather-Dashboard-with-Chatbot-Integration-using-OpenWeather-API
   ```

2. Navigate to the project directory:
   ```
   cd weather-dashboard
   ```

3. Open the `index.html` file in your web browser.

4. Replace the API keys in the `app.js` file:
   - Replace `YOUR_OPENWEATHER_API_KEY` with your OpenWeather API key.
   - Replace `YOUR_GEMINI_API_KEY` with your Gemini API key.

## Usage

1. Enter a city name in the search bar and press Enter to load weather data for that city.
2. Use the "Switch to °F/°C" button to toggle between Celsius and Fahrenheit.
3. Navigate between the Dashboard and Tables views using the sidebar menu.
4. Use the chatbot to ask weather-related questions or get general information.
5. Toggle dark mode using the moon/sun icon in the bottom left corner.

## Known Limitations

- API keys are exposed in the frontend code (should be moved to backend in production)
- Limited to 5-day forecast due to API constraints
- Requires internet connection for API calls

## Future Improvements

- Add backend server to secure API keys
- Implement user authentication
- Add more weather data visualizations
- Enhance chatbot capabilities
- Add weather alerts and notifications

## Acknowledgements

- OpenWeather API for providing weather data
- Chart.js for the charting library
- Gemini API for powering the AI chatbot

## Support

For support, please open an issue in the repository or contact hamzaifj@gmail.com
