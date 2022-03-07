const express = require("express");
const request = require("request");

const app = express();

// configure dotenv
require("dotenv").config();

// setup api
const apiKey = process.env.API_KEY;

app.use(express.static(`${__dirname}/public`));
app.use(express.urlencoded({ extended: true }));
// set javascript template view engine
app.set("view engine", "ejs");

// display default
app.get("/", (req, res) => {
  res.render("index", { weather: null, error: null });
});

app.post("/", (req, res) => {
  let city = encodeURI(req.body.city);
  let country = encodeURI(req.body.country) || "";

  let query = country === "" ? `${city}` : `${city}, ${country}`;

  let url = `http://api.openweathermap.org/data/2.5/weather?q=${query}&units=metric&lang=vi&appid=${apiKey}`;
  console.log(url);

  // Request for data using the URL
  request(url, (err, response, body) => {
    // check the json data fetched
    if (err) {
      console.error(err);
      res.render("index", { weather: null, error: "Error, please try again" });
    } else {
      let weather = JSON.parse(body);
      // log weather to output
      console.log(weather);

      // check weather
      if (weather.main === undefined) {
        res.render("index", {
          weather: null,
          error: "Error, please try again"
        });
      } else {
        // get place position
        let place = `${weather.name}, ${weather.sys.country}`;

        // get date time
        var options = {
          weekday: "short",
          year: "numeric",
          month: "2-digit",
          day: "numeric"
        };
        let timezone = `${new Date(
          weather.dt * 1000 - weather.timezone * 1000
        ).toLocaleDateString("vi", options)}`;

        // get the necessary parameters
        let temp = weather.main.temp,
          temp_min = weather.main.temp_min,
          temp_max = weather.main.temp_max,
          pressure = weather.main.pressure,
          feels_like = weather.main.feel_like,
          humidity = weather.main.humidity,
          description = weather.weather[0].description,
          icon = `http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`,
          visibility = weather.visibility,
          wind = weather.wind.speed;

        res.render("index", {
          place,
          timezone,
          weather,
          temp,
          humidity,
          description,
          icon,
          visibility,
          wind
        });
      }
    }
  });
});

let PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`App listen on port ${PORT}`);
});
