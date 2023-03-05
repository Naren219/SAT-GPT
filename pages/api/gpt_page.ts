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
  console.log(prompt);
  if (!prompt) {
    return res.status(400).json({ error: "Prompt missing" });
  }

  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt as string,
    max_tokens: 843,
    temperature: 0.25,
    presence_penalty: 0.9,
    frequency_penalty: 1,
  });

  const question = completion.data.choices[0].text;
  console.log(question);
  res.status(200).json({ question });
}