import express, { json } from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors()); // Allow client-side requests
app.use(express.json());

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Set up rate-limiting middleware
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 100 requests per `windowMs`
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

app.use(limiter); // Apply rate-limiting globally to all routes

/// Endpoint to fetch current weather
app.get('/weather', async (req, res) => {
  const city = req.query.city;
  const lang = req.query.lang;

  console.log(`[LOG] /weather endpoint called with city: ${city}, lang: ${lang}`);

  if (!city) {
    console.error(`[ERROR] /weather: City parameter is missing`);
    return res.status(400).json({ error: 'City is required' });
  }

  if (!lang) {
    console.error(`[ERROR] /weather: Language parameter is missing`);
    return res.status(400).json({ error: 'Language is required' });
  }

  const url = `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric&lang=${lang}`;
  console.log(`[LOG] /weather: Fetching data from URL: ${url}`);

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(`[LOG] /weather: Response received from OpenWeather:`, Object.keys(data).length);

    res.status(200).json(data);
  } catch (error) {
    console.error(`[ERROR] /weather: Failed to fetch weather data:`, error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Endpoint to fetch 5-day weather forecast
app.get('/forecast', async (req, res) => {
  const city = req.query.city;
  const lang = req.query.lang;

  console.log(`[LOG] /forecast endpoint called with city: ${city}, lang: ${lang}`);

  if (!city) {
    console.error(`[ERROR] /forecast: City parameter is missing`);
    return res.status(400).json({ error: 'City is required' });
  }

  if (!lang) {
    console.error(`[ERROR] /forecast: Language parameter is missing`);
    return res.status(400).json({ error: 'Language is required' });
  }

  const url = `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=${lang}`;
  console.log(`[LOG] /forecast: Fetching data from URL: ${url}`);

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(`[LOG] /forecast: Response received from OpenWeather:`, Object.keys(data).length);

    res.status(200).json(data);
  } catch (error) {
    console.error(`[ERROR] /forecast: Failed to fetch forecast data:`, error);
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
