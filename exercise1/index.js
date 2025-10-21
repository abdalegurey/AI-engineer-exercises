import 'dotenv/config'; // load .env variables
import OpenAI from 'openai';
import readlineSync from 'readline-sync';

const openai = new OpenAI({
  apiKey: process.env.OPENAIkeys
});

async function generateText() {
  // Take user input
  const topic = readlineSync.question("Enter a topic: ");
  console.log("You entered:", topic);

  // Create a streaming response
  const stream = await openai.chat.completions.create(
    {
      model: "gpt-4",
      messages: [{ role: "user", content: ` ${topic}` }],
      stream: true
    }
  );

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

  return result;
}

generateText();
