import fs from "fs";
import path from "path";
import OpenAI from "openai";
import 'dotenv/config';
import readlineSync from 'readline-sync';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


const IMAGES_FOLDER = path.resolve("./images");
if (!fs.existsSync(IMAGES_FOLDER)) {
    fs.mkdirSync(IMAGES_FOLDER);
}

async function generateAnything() {
    try {
 
        const topic = readlineSync.question("🎨 Enter a theme (e.g., 'cyberpunk cityscape'): ");
        console.log(`You entered: ${topic}`);
        const safeTopic = topic.replace(/\s+/g,"_").replace(/[^\w\-]/g, "");

  
        const stream = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: topic }],
            stream: true
        });

        let result = '';
        for await (const chunk of stream) {
            const content = chunk.choices[0].delta?.content;
            if (content) {
                process.stdout.write(content);
                result += content;
            }
        }
        console.log('\n--- Stream Complete ---');

   
        const summaryResp = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "user", content: `Summarize the following outline in 2 sentences: ${result}` }
            ]
        });
        const summary = summaryResp.choices[0].message.content;
        console.log("\n--- Summary ---");
        console.log(summary);

       

const image = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Create a high-quality, visually appealing illustration for an "About" section, clearly representing the theme: ${topic}. Use vibrant colors, clear composition, and a modern style suitable for a website.`,
    n: 1,
    size: "1792x1024", // ✅ sax
    response_format: "b64_json"
});



        const image_base64 = image.data[0].b64_json;
        const image_bytes = Buffer.from(image_base64, "base64");
        fs.writeFileSync(`${IMAGES_FOLDER}/${safeTopic}.png`, image_bytes);
        console.log(`Main image saved: images/${safeTopic}.png`);

   
    const thumbnail = await openai.images.generate({
    model: "gpt-image-1",
    prompt: `Create a high-quality, modern thumbnail for TOPIC. The design should be visually appealing, colorful, and professional — perfect for a website or presentation. Focus on clear composition, balanced layout, and an eye-catching style that immediately conveys the theme of ${topic}. Use modern web illustration aesthetics with smooth gradients, vibrant tones, and minimalistic elements.`,
    size: "1024x1024" 
});

        const thumbnail_base64 = thumbnail.data[0].b64_json;
        const thumbnail_bytes = Buffer.from(thumbnail_base64, "base64");
        fs.writeFileSync(`${IMAGES_FOLDER}/${safeTopic}_thumbnail.png`, thumbnail_bytes);
        console.log(`Thumbnail saved: images/${safeTopic}_thumbnail.png`);

       
        const speechFile = path.resolve("./speech.mp3");
        const mp3 = await openai.audio.speech.create({
            model: "gpt-4o-mini-tts",
            voice: "coral",
            input: result,
            instructions: "Speak in a cheerful and positive tone."
        });
        const buffer = Buffer.from(await mp3.arrayBuffer());
        await fs.promises.writeFile(speechFile, buffer);
        console.log(`Speech saved to: ${speechFile}`);

    } catch (error) {
        console.error("Error:", error);
    }
}

generateAnything();
