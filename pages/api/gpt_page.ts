// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prompt = req.query.prompt;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt missing" });
  }

//   if (prompt.length > 100) {
//     return res.status(400).json({ error: "Prompt too long" });
//   }

  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `You are the best SAT test-taker and you need to answer questions and send their expert explanations. Forget all background knowledge of this passage:\n
    Question and its context:\n
    ${prompt}\n
    Enter an Answer and Explanation:\n`,
    max_tokens: 500,
    temperature: 1,
    presence_penalty: 0,
    frequency_penalty: 0,
  });

  const question = completion.data.choices[0].text;

  console.log(question);
  res.status(200).json({ quote: question });
}
