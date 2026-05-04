exports.handler = async (event) => {
  const city = event.queryStringParameters.city;
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.API_KEY}`,
  );
  const data = await response.json();
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
