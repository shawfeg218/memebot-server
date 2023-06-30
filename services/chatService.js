// file: services\audioChatService.js

const { OpenAIApi, Configuration } = require('openai');
const textToSpeech = require('@google-cloud/text-to-speech');
const speechClient = new textToSpeech.TextToSpeechClient({
  keyFilename: './meme-bot-391406-47b18ce0fb21.json',
});
const openaiKey = process.env.OPENAI_API_KEY;

exports.chat = async (question) => {
  // console.log(openaiKey);
  try {
    const prompt =
      'You are going to be a good chatbot, capable of judging the situation to derive the most suitable answer to the question asked by the child.';
    const configuration = new Configuration({ apiKey: openaiKey });
    const openai = new OpenAIApi(configuration);

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: prompt,
        },
        {
          role: 'user',
          content: `你將成為一個出色的聊天機器人，能夠判斷情境並對孩子的問題給出最合適的答案，請以繁體中文回答以下的問題: "${question}"`,
        },
      ],
    });

    const { data } = response;
    // console.log('Data: ', data);
    // console.log(data.choices[0].message);

    return data.choices[0].message.content;
  } catch (error) {
    if (error.response) {
      throw {
        name: 'APIError',
        message: error.response.data.error.message,
      };
    } else {
      throw {
        name: 'UnknownError',
        message: error.message,
      };
    }
  }
};

exports.textToSpeech = async (answer) => {
  const text = `${answer}`;
  try {
    const response = await speechClient.synthesizeSpeech({
      audioConfig: {
        audioEncoding: 'MP3',
        effectsProfileId: ['small-bluetooth-speaker-class-device'],
        pitch: 0,
        speakingRate: 1,
      },
      input: {
        text: text,
      },
      voice: {
        languageCode: 'cmn-TW',
        name: 'cmn-TW-Standard-C',
      },
    });

    const audioContent = response[0].audioContent;
    const audioContentBase64 = audioContent.toString('base64');

    return audioContentBase64;
  } catch (error) {
    console.log('Error in textToSpeech:', error);
    throw error;
  }
};
