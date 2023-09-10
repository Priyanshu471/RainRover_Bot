import { bot, API } from "../index.js";
import axios from "axios";
import { userModel } from "../model/user.js";

const reportGenerator = (location, current) => {
  return `Today in ${location.name} 🏙️\nTemperature: ${
    current.temperature
  }°\nWeather status: ${
    (current.weather_descriptions[0].toLowerCase().includes("clear") === true &&
      "🖼️") ||
    (current.weather_descriptions[0].toLowerCase().includes("sunny") === true &&
      "☀️") ||
    (current.weather_descriptions[0].toLowerCase().includes("cloud") === true &&
      "⛅") ||
    (current.weather_descriptions[0].toLowerCase().includes("overcast") ===
      true &&
      "☁️") ||
    (current.weather_descriptions[0].toLowerCase().includes("rain") === true &&
      "🌧") ||
    (current.weather_descriptions[0].toLowerCase().includes("snow") === true &&
      "❄️")
  } ${current.weather_descriptions[0]}\nHumidity: ${
    current.humidity
  }%💧\nWind speed: ${current.wind_speed}km/h💨\nVisibility: ${
    current.visibility
  }km👓\nHave a nice day 🎊`;
};

export const sendWeather = async (chatId, city) => {
  console.log(city);
  const url = `http://api.weatherstack.com/current?access_key=${API}&query=${city}`;
  try {
    const { data } = await axios.get(url);
    const { location, current } = data;
    const weatherReport = reportGenerator(location, current);
    bot.sendPhoto(chatId, current.weather_icons[0]);
    bot.sendMessage(chatId, weatherReport);
  } catch (error) {
    bot.sendMessage(
      chatId,
      `Oops, looks like city doesn't exist 🤔\nPlease write it again or go to /help`
    );
  }
};
export const dailyWeather = async () => {
  const users = await userModel.find({ isSubscribed: true });
  const subscribers = {
    users: users.map((user) => user.userId),
    names: users.map((user) => user.name),
    cities: users.map((user) => user.userCity),
  };
  subscribers.users.forEach((user, index) => {
    bot.sendMessage(
      user,
      `Good morning, ${subscribers.names[index]}!. Here is your daily weather report 📰`
    );
    sendWeather(user, subscribers.cities[index]);
  });
};
