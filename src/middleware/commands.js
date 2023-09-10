import { bot, GIF } from "../index.js";
import { userModel } from "../model/user.js";

export const Help = (msg) => {
  // console.log(msg.chat.id);
  bot.sendMessage(
    msg.chat.id,
    "Hey!, Just write the name of city like Delhi, London, Tokyo, Moscow etc. We have subscription service also, if you want to subscribe just write /subscribe and if you want to unsubscribe just write /unsubscribe"
  );
};

export const Start = (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `Hello ${msg.from.first_name}!, I am a bot that can tell you the weather in your city.My name is Rainrover, nice to meet you! `
  );
  bot.sendAnimation(msg.chat.id, `${GIF}`);
};

const getMsgId = async (chatId) => {
  try {
    const msg = await bot.sendMessage(
      chatId,
      "Please send the name of city in reply to this message..."
    );
    return msg.message_id;
  } catch (error) {
    console.log(error);
  }
};

export const Subscribe = async (msg) => {
  const chatId = msg.chat.id;
  const { id, first_name } = msg.from;
  try {
    const data = await userModel.findOne({ userId: id });
    if (data && data.isSubscribed) {
      bot.sendMessage(
        chatId,
        `Hey ${first_name}, you have already subscribed to our service.`
      );
      return;
    }

    const msgId = await getMsgId(chatId);
    let city = "default";
    bot.onReplyToMessage(chatId, msgId, async (msg) => {
      city = msg.text;
      bot.sendMessage(
        chatId,
        "Thanks for subscribing to our service, you will get weather updates daily at 8 a.m for " +
          city
      );
      console.log("city: ", city);
      await userModel
        .updateOne({ userId: id }, { isSubscribed: true, userCity: city })
        .catch((err) => console.log(err));
    });
  } catch (error) {
    console.log(error);
  }
};

export const Unsubscribe = async (msg) => {
  const { id } = msg.from;
  const user = await userModel.findOne({ userId: id });
  if (user && user.isSubscribed) {
    bot.sendMessage(
      msg.chat.id,
      `Hey ${msg.from.first_name}, you have unsubscribed to our service. 🙄\nFor any feedback https://t.me/Chat_withPriyanshu`
    );
    await userModel.updateOne(
      { userId: id },
      { isSubscribed: false, userCity: "" }
    );
  } else {
    bot.sendMessage(
      msg.chat.id,
      `Hey ${msg.from.first_name}, you are not subscribed to our service 🫤. for subscribe write /subscribe `
    );
  }
};

export const Change = async (msg) => {
  const chatId = msg.chat.id;
  const { id } = msg.from;
  try {
    const user = await userModel.findOne({ userId: id });
    if (user && user.isSubscribed) {
      const msgId = await getMsgId(chatId);
      let city = "default";
      bot.onReplyToMessage(chatId, msgId, async (msg) => {
        city = msg.text;
        await userModel
          .updateOne({ userId: id }, { userCity: city })
          .catch((err) => console.log(err));
        bot.sendMessage(chatId, `Your city has been changed to ${city} 🎉`);
      });
    } else {
      bot.sendMessage(
        msg.chat.id,
        `Hey ${msg.from.first_name}, you are not subscribed to our service 🫤. for subscribe write /subscribe `
      );
    }
  } catch (error) {
    console.log(error);
  }
};
