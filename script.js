// ── Constants ──
// Base URLs and credentials used across all API calls
const API_BASE = "https://api.openweathermap.org/data/2.5";
const ICON_BASE = "https://openweathermap.org/img/wn";

const DEFAULT_CITY = "Boston"; // Fallback city if none is provided

// ── DOM References ──
// All elements we'll write data into, grouped in one object for easy access
const els = {
  day: document.querySelector(".day"), // Weekday name (e.g. "Tuesday")
  date: document.querySelector(".date"), // Full date (e.g. "April 28, 2026")
  condition: document.querySelector(".condition"), // Weather condition (e.g. "Clouds")
  icon: document.querySelector(".icon"), // Current weather icon <img>
  temp: document.querySelector(".current-temp"), // Current temperature
  city: document.querySelector(".location"), // City name
  hourly: document.querySelector(".hourly-section"), // Container for hourly forecast cards
};

// ── Date Helpers ──
// Static lookup arrays to convert numeric month/day indexes to readable names
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Compute today's values once at load time so we don't repeat the work on every call
const now = new Date();
const todayString = `${
  MONTHS[now.getMonth()]
} ${now.getDate()}, ${now.getFullYear()}`; // e.g. "April 28, 2026"
const todayWeekday = WEEKDAYS[now.getDay()]; // e.g. "Tuesday"

// Writes the current weekday and full date into the header of the weather card
function displayDate() {
  els.day.textContent = todayWeekday;
  els.date.textContent = todayString;
}

// ── Icon URL Helper ──
// Builds the full OpenWeatherMap icon URL from a given icon code (e.g. "10d")
const iconURL = (code) => `${ICON_BASE}/${code}@2x.png`;

// ── Fetch Current Weather ──
// Hits the /weather endpoint and populates the main weather card with
// condition, icon, temperature, city name, and today's high/low
async function fetchWeather(city = DEFAULT_CITY) {
  try {
    const res = await fetch(
      `/.netlify/functions/weather?city=${city}&type=forecast`,
    );
    if (!res.ok) return; // Silently bail on non-200 responses

    const data = await res.json();
    const iconCode = data.weather[0].icon;

    // Populate the current weather card fields
    els.condition.textContent = data.weather[0].main;
    els.icon.src = iconURL(iconCode);
    els.temp.textContent = `${data.main.temp}°F`;
    els.city.textContent = data.name;

    // Build and append the high/low temperature block to the hourly panel
    const high = Object.assign(document.createElement("div"), {
      className: "temp-max",
      textContent: `H: ${data.main.temp_max}°F`,
    });
    const low = Object.assign(document.createElement("div"), {
      className: "temp-min",
      textContent: `L: ${data.main.temp_min}°F`,
    });
    const highLow = Object.assign(document.createElement("div"), {
      className: "temp-container",
    });
    highLow.append(high, low);
    els.hourly.appendChild(highLow);

    return data;
  } catch (err) {
    console.error("fetchWeather error:", err.message);
  }
}

// ── Fetch Hourly Forecast ──
// Hits the /forecast endpoint (returns data in 3-hour intervals for 5 days)
// and renders a horizontal row of cards for entries that fall on today's date
async function fetchForecast(city = DEFAULT_CITY) {
  try {
    const res = await fetch(
      `${API_BASE}/forecast?q=${city}&units=imperial&appid=${API_KEY}`,
    );
    if (!res.ok) return; // Silently bail on non-200 responses

    const data = await res.json();
    const container = document.createElement("div");
    container.className = "hours-info-container"; // Flex row that holds all hourly cards

    data.list.forEach((entry) => {
      // Extract just the date portion (e.g. "2026-04-28") to compare against today
      const dateOnly = entry.dt_txt.split(" ")[0];
      const formattedDate = new Date(dateOnly).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      // Skip entries that don't belong to today
      if (formattedDate !== todayString) return;

      // Convert the forecast timestamp to a readable local time (e.g. "3 PM")
      // Replace the space with "T" so the Date constructor parses it correctly
      const time = new Date(entry.dt_txt.replace(" ", "T")).toLocaleTimeString(
        "en-US",
        {
          timeZone: "America/New_York",
          hour12: true,
          hour: "numeric",
        },
      );

      // Build the three elements that make up each hourly card: time, icon, temp
      const timeEl = Object.assign(document.createElement("div"), {
        className: "hourly-time",
        textContent: time,
      });
      const imgEl = Object.assign(document.createElement("img"), {
        className: "hourly-icon",
        src: iconURL(entry.weather[0].icon),
      });
      const tempEl = Object.assign(document.createElement("div"), {
        className: "hourly-temp",
        textContent: `${entry.main.temp}°F`,
      });

      // Assemble the card and add it to the row container
      const card = Object.assign(document.createElement("div"), {
        className: "hours-info",
      });
      card.append(timeEl, imgEl, tempEl);
      container.appendChild(card);
    });

    els.hourly.appendChild(container);
    return data;
  } catch (err) {
    console.error("fetchForecast error:", err.message);
  }
}

// ── Init ──
// Kick everything off: render the date header, then fetch weather data
displayDate();
fetchWeather();
fetchForecast();
