import 'dotenv/config';
import OpenAI from 'openai';
import readlineSync from 'readline-sync';
import fs from 'fs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateImage() {
  const topic = readlineSync.question("🎨 Enter a theme (e.g., 'cyberpunk cityscape'): ");
  console.log(`You entered: ${topic}`);

  const models = ["gpt-image-1", "dall-e-3"];
  const sizes = ["1024x1024", "1792x1024", "1024x1792"];
  const styles = ["vivid", "natural"];
  const outputDir = "images";

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const metadata = [];

  for (const model of models) {
    for (const size of sizes) {
      for (const style of styles) {
        console.log(`🖼 Generating with ${model} | ${size} | ${style} ...`);
        try {
          const image = await openai.images.generate({
            model,
            prompt: topic,
            n: 1,
            size,
            quality: "hd",
            style,
            response_format: "b64_json"
          });

          const image_base64 = image.data[0].b64_json;
          const image_bytes = Buffer.from(image_base64, "base64");
          const fileName = `${model}_${size}_${style}.png`;
          const filePath = `${outputDir}/${fileName}`;

          fs.writeFileSync(filePath, image_bytes);

          const revised = image.data[0].revised_prompt || "N/A";

          metadata.push({
            file: fileName,
            model,
            size,
            style,
            revisedPrompt: revised,
            topic
          });

          console.log(`✅ Saved: ${filePath}`);
        } catch (error) {
          console.error(`❌ Error with ${model} ${size} ${style}:`, error.message);
        }
      }
    }
  }


  fs.writeFileSync(`${outputDir}/metadata.json`, JSON.stringify(metadata, null, 2));
  console.log(`📄 Metadata saved: ${outputDir}/metadata.json`);



}



generateImage();
