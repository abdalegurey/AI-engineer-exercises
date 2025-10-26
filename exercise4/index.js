import fs from "fs";
import OpenAI from "openai";
import 'dotenv/config';
import readlineSync from 'readline-sync';
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


 async function generateAnything() {

     try {
        
         const topic = readlineSync.question("🎨 Enter a theme (e.g., 'cyberpunk cityscape'): ");
  console.log(`You entered: ${topic}`);

    const stream = await openai.chat.completions.create(
    {
      model: "gpt-4",
      messages: [{ role: "user", content: ` ${topic}` }],
      stream: true
    }
  );

  console.log("stream",stream)

   let result = '';
  // Stream chunks
  for await (const chunk of stream) {
    const content = chunk.choices[0].delta?.content;
    if (content) {
      process.stdout.write(content); // show progress in real-time
      result += content;
    }
  }

  console.log('\n--- Stream Complete ---');

  // Summarize in 2 sentences
  const summaryResp = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "user", content: `Summarize the following outline in 2 sentences: ${result}` }
    ]
  });

  const summary = summaryResp.choices[0].message.content;
  console.log("\n--- Summary ---");
  console.log(summary);

  ///////////

  // With quality and style parameters (DALL-E 3)
const image = await openai.images.generate({
  model: "dall-e-3",
prompt : `Create a high-quality, visually appealing illustration for an "About" section, clearly representing the theme: ${topic}. Use vibrant colors, clear composition, and a modern style suitable for a website.`,

  n: 1,
  size: "1792x1024",
  quality: "hd", // "standard" or "hd"
  style: "vivid", // "vivid" or "natural"
  response_format: "b64_json", // Required for DALL-E 3 to return base64
});

// Create images folder if it doesn't exist
if (!fs.existsSync('images')) {
    fs.mkdirSync('images');
}

// Save the high-quality image to a file
const image_base64 = image.data[0].b64_json;
const image_bytes = Buffer.from(image_base64, "base64");
fs.writeFileSync(`images/${topic}.png`, image_bytes);

console.log("Image saved as images/cityscape.png");
console.log("Revised prompt:", image.data[0].revised_prompt);

const speechFile = path.resolve("./speech.mp3");

// Using the latest gpt-4o-mini-tts model with instructions
const mp3 = await openai.audio.speech.create({
  model: "gpt-4o-mini-tts",
  voice: "coral",
  input: result,
  instructions: "Speak in a cheerful and positive tone.",
});


const buffer = Buffer.from(await mp3.arrayBuffer());
await fs.promises.writeFile(speechFile, buffer);
console.log(`Speech saved to: ${speechFile}`);
     } catch (error) {

        console.log("error",error)
        
     }

    
}

generateAnything()