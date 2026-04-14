const BASE_URL = 'https://api.open-meteo.com/v1/forecast'

export async function getCurrentWeather(lat, lng) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lng,
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'precipitation',
      'weathercode',
      'windspeed_10m',
      'winddirection_10m',
      'apparent_temperature',
      'uv_index',
    ].join(','),
    timezone: 'Africa/Lagos',
    forecast_days: 1,
  })
  const res = await fetch(`${BASE_URL}?${params}`)
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`)
  const data = await res.json()
  return data.current
}

export async function getWeatherForecast(lat, lng) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lng,
    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'weathercode',
      'windspeed_10m_max',
      'precipitation_probability_max',
    ].join(','),
    timezone: 'Africa/Lagos',
    forecast_days: 7,
  })
  const res = await fetch(`${BASE_URL}?${params}`)
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`)
  const data = await res.json()
  return data.daily
}

export function getWeatherDescription(code) {
  const codes = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Icy fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Heavy drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight showers',
    81: 'Moderate showers',
    82: 'Heavy showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with heavy hail',
  }
  return codes[code] ?? 'Unknown'
}

export function getWeatherIcon(code) {
  if (code === 0 || code === 1) return '☀️'
  if (code === 2 || code === 3) return '⛅'
  if (code === 45 || code === 48) return '🌫️'
  if (code >= 51 && code <= 55) return '🌦️'
  if (code >= 61 && code <= 65) return '🌧️'
  if (code >= 71 && code <= 77) return '❄️'
  if (code >= 80 && code <= 82) return '🌨️'
  if (code >= 95) return '⛈️'
  return '🌡️'
}

export function getConstructionSafetyRating(weather) {
  const alerts = []
  let rating = 'Safe'

  if (weather.windspeed_10m > 30) {
    alerts.push({
      level: 'danger',
      message: `High wind warning — suspend crane lifts and scaffolding erection. Wind speed: ${Math.round(weather.windspeed_10m)} km/h`,
    })
    rating = 'Danger'
  } else if (weather.windspeed_10m > 20) {
    alerts.push({
      level: 'warning',
      message: `Elevated wind speed — monitor crane operations and secure loose materials. Wind: ${Math.round(weather.windspeed_10m)} km/h`,
    })
    if (rating === 'Safe') rating = 'Caution'
  }

  if (weather.precipitation > 10) {
    alerts.push({
      level: 'danger',
      message: `Heavy rain — suspend excavation works, check trench stability, cover all electrical installations. Precipitation: ${weather.precipitation}mm`,
    })
    rating = 'Danger'
  } else if (weather.precipitation > 2) {
    alerts.push({
      level: 'warning',
      message: 'Rain detected — protect fresh concrete, check excavation drainage, ensure worker PPE includes wet weather gear.',
    })
    if (rating === 'Safe') rating = 'Caution'
  }

  if (weather.temperature_2m > 38) {
    alerts.push({
      level: 'danger',
      message: `Extreme heat alert — mandatory rest breaks every 45 minutes. Provide shade and water stations. Temperature: ${Math.round(weather.temperature_2m)}°C`,
    })
    if (rating === 'Safe') rating = 'Caution'
  } else if (weather.temperature_2m > 35) {
    alerts.push({
      level: 'warning',
      message: `High temperature — monitor workers for heat stress. Schedule heavy work for early morning. Temp: ${Math.round(weather.temperature_2m)}°C`,
    })
    if (rating === 'Safe') rating = 'Caution'
  }

  if (weather.weathercode >= 95) {
    alerts.push({
      level: 'danger',
      message: 'Thunderstorm — evacuate all workers from elevated positions, cranes, and scaffolding immediately. Suspend all outdoor work.',
    })
    rating = 'Danger'
  }

  return { rating, alerts }
}

export function getDailyConstructionRating(day) {
  let score = 100
  if (day.windspeed_10m_max > 30) score -= 40
  else if (day.windspeed_10m_max > 20) score -= 20
  if (day.precipitation_sum > 10) score -= 40
  else if (day.precipitation_sum > 2) score -= 20
  if (day.temperature_2m_max > 38) score -= 20
  else if (day.temperature_2m_max > 35) score -= 10
  if (day.weathercode >= 95) score -= 50

  if (score >= 80) return { label: 'Good', color: 'success' }
  if (score >= 50) return { label: 'Caution', color: 'warning' }
  return { label: 'Poor', color: 'danger' }
}

export function getOperationImpact(forecast) {
  return {
    concrete: {
      name: 'Concrete works',
      safe: forecast.precipitation_sum < 2 && forecast.temperature_2m_max < 35,
      note: forecast.precipitation_sum >= 2
        ? 'Rain risk — protect fresh concrete'
        : forecast.temperature_2m_max >= 35
        ? 'High temp — use chilled water, cure immediately'
        : 'Conditions suitable',
    },
    scaffolding: {
      name: 'Scaffolding erection',
      safe: forecast.windspeed_10m_max < 25,
      note: forecast.windspeed_10m_max >= 25
        ? 'Wind too high — suspend erection'
        : 'Wind conditions acceptable',
    },
    crane: {
      name: 'Crane operations',
      safe: forecast.windspeed_10m_max < 30 && forecast.weathercode < 95,
      note: forecast.windspeed_10m_max >= 30
        ? 'Wind exceeds crane limits — no lifts'
        : forecast.weathercode >= 95
        ? 'Storm — no crane operations'
        : 'Conditions suitable for lifts',
    },
    excavation: {
      name: 'Excavation works',
      safe: forecast.precipitation_sum < 5,
      note: forecast.precipitation_sum >= 5
        ? 'Rain risk — check trench stability before entry'
        : 'Conditions suitable',
    },
    roofing: {
      name: 'Roofing works',
      safe: forecast.windspeed_10m_max < 20 && forecast.precipitation_sum < 1,
      note: forecast.windspeed_10m_max >= 20
        ? 'Wind risk — suspend roofing'
        : forecast.precipitation_sum >= 1
        ? 'Rain risk — slippery surfaces'
        : 'Conditions suitable',
    },
    electrical: {
      name: 'Electrical works',
      safe: forecast.precipitation_sum < 1 && forecast.weathercode < 95,
      note: forecast.precipitation_sum >= 1
        ? 'Rain — suspend external electrical works'
        : forecast.weathercode >= 95
        ? 'Storm — no electrical works'
        : 'Conditions suitable',
    },
  }
}
