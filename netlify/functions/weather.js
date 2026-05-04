exports.handler = async (event) => {
  const { city, type } = event.queryStringParameters;
  const endpoint = type === "forecast" ? "forecast" : "weather";
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&units=imperial&appid=${process.env.API_KEY}`,
  );
  const data = await res.json();
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
