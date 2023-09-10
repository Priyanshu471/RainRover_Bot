import telegramBot from "node-telegram-bot-api";
import { config } from "dotenv";
import cron from "node-cron";
import {
  Start,
  Help,
  Subscribe,
  Unsubscribe,
  Change,
} from "./middleware/commands.js";
import { dailyWeather, sendWeather } from "./middleware/Weather.js";
import { userModel } from "./model/user.js";
import { connectDB } from "./database.js";

config();
connectDB();
const TOKEN = process.env.TOKEN;
export const API = process.env.API_KEY;
export const GIF = process.env.BOT_GIF;
export const bot = new telegramBot(TOKEN, { polling: true });

bot.on("message", async (msg) => {
  const text = msg.text;
  const { id, first_name } = msg.from;
  const user = await userModel.findOne({ userId: id });
  if (!user) {
    await userModel.create({
      name: first_name,
      userId: id,
    });
  }
  switch (text) {
    case "/start": {
      Start(msg);
      break;
    }
    case "/help": {
      Help(msg);
      break;
    }
    case "/subscribe": {
      Subscribe(msg);
      break;
    }
    case "/unsubscribe": {
      Unsubscribe(msg);
      break;
    }
    case "/change": {
      Change(msg);
      break;
    }
    default: {
      sendWeather(msg.chat.id, msg.text);
      break;
    }
  }
});
cron.schedule("0 8 * * *", dailyWeather);

bot.on("polling_error", (err) => console.log(err));
