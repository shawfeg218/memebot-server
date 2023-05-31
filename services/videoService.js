// file: services/videoService.js
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const ytdl = require('ytdl-core');

const apiKey = process.env.OPENAI_API_KEY;

// exports.downloadVideo = async (videoUrl) => {
//   const videoId = new URL(videoUrl).searchParams.get('v');

//   if (!videoId) {
//     throw new Error('Invalid video url');
//   }

//   const stream = ytdl(videoUrl, { quality: 'highest', format: 'mp4' });

//   const writeStream = fs.createWriteStream(`./tmp/${videoId}.mp4`);

//   stream.pipe(writeStream);

//   return new Promise((resolve, reject) => {
//     writeStream.on('finish', () => resolve(`./tmp/${videoId}.mp4`));
//     writeStream.on('error', reject);
//   });
// };

exports.transcribeVideo = async (videoUrl) => {
  const stream = ytdl(videoUrl, { quality: 'highestaudio', format: 'mp4' });
  const formData = new FormData();
  formData.append('file', stream, 'video.mp4');
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'srt');
  console.log(apiKey);

  const response = await fetch(
    'https://api.openai.com/v1/audio/transcriptions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    console.log(response.statusText);
    throw new Error(response.statusText);
  } else {
    const responseText = await response.text();
    // console.log(responseText);
    return responseText;
  }
};

exports.translateTranscription = async (transcription) => {
  const prompt =
    'You are going to be a good translator, capable of judging the situation to derive the most suitable meaning, and translating it into traditional Chinese.';
  console.log(transcription);
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: prompt,
        },
        {
          role: 'user',
          content: `翻譯以下內容為繁體中文，但請保留句子的編號與時間的標示: "${transcription}"`,
        },
      ],
    }),
  });

  if (!response.ok) {
    // console.log(response);
    throw new Error(response.message);
  } else {
    // console.log(response);
    const responseJson = await response.json();
    // console.log(responseJson);
    const ans = responseJson['choices'][0]['message']['content'];
    // console.log(ans);
    return ans;
  }
};
