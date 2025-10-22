import fs from "fs";
import OpenAI from "openai";
import 'dotenv/config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


async function generateTTS() {

const conversation = [
  { speaker: "Alice", text: "Hi Bob! How are you today?", voice: "alloy", emotion: "happy" },
  { speaker: "Bob", text: "Hey Alice! I'm feeling a bit tired.", voice: "echo", emotion: "tired" },
  { speaker: "Alice", text: "Oh no! Maybe some coffee will help!", voice: "alloy", emotion: "excited" },
  { speaker: "Bob", text: "Good idea! Thanks for the suggestion.", voice: "echo", emotion: "grateful" }
];


  if (!fs.existsSync("audio")) fs.mkdirSync("audio");

  for (let i = 0; i < conversation.length; i++) {
    const { speaker, text, voice, emotion } = conversation[i];
    console.log(`🎤 Generating TTS for ${speaker}...`);

    const response = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice,         
      input: text,
      format: "mp3",
      emotion       
    });

    const audioData = Buffer.from(await response.arrayBuffer());
    const filename = `audio/${i + 1}_${speaker}.mp3`;
    fs.writeFileSync(filename, audioData);

    console.log(`✅ Saved: ${filename}`);
  }

  console.log("🎉 All TTS files generated!");
}

generateTTS();
