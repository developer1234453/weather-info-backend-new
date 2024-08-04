const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/weather', async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).send({ error: 'City is required' });
  }

  try {
    const apiKey = process.env.WEATHERSTACK_API_KEY;
    const response = await axios.get('https://api.weatherbit.io/v2.0/current', {
      params: {
        city: city,
        key: apiKey,
        units: 'M', // Metric units (Celsius)
      },
    });

    if (response.status === 200) {
      const data = response.data.data[0]; // Weatherbit API returns data in an array
      res.send({
        location: data.city_name,
        temperature: data.temp,
        description: data.weather.description,
      });
    } else {
      res.status(response.status).send({ error: response.data.error });
    }
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    if (error.response) {
      res.status(error.response.status).send({ error: error.response.data.error });
    } else if (error.request) {
      res.status(503).send({ error: 'No response from the weather service. Please try again later.' });
    } else {
      res.status(500).send({ error: 'An unexpected error occurred.' });
    }
  }
});

app.listen(port, () => {
  console.log(`Weather Info Service is running on http://localhost:${port}`);
});
