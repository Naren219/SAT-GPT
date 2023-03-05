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

  const quote = completion.data.choices[0].text;
  console.log(quote);
  res.status(200).json({ quote });
}

/*
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const response = await openai.createCompletion({
  model: "text-davinci-003",
  prompt: "You are an expert test-taker about to take the SAT. You will consider how the passage might be edited to correct errors in sentence structure, usage, or punctuation. \n\npassage 1\nAlso, because it is more concentrated, Greek yogurt contains slightly more protein per serving, thereby helping people stay satiated for longer periods of time.\n\nchange all instances of the word \"satiated\" with a synonym from the below choices that best maintains the flow of passage 2. Pay attention to the purpose of the passage and which synonym matches up most with it. Choose the answer to each question that most effectively improves the quality of writing in the passage or that makes the passage conform to the conventions of standard written English. If the word \"satiated\" is the best word in context, select \"A\". Output both a letter choice and an explanation of why the other choices are incorrect: \n\nA) satiated\nB) fulfilled\nC) complacent\nD) sufficient\n\nA) satiated - Satiated is the best choice because it conveys the idea that people are feeling full and satisfied after eating Greek yogurt, which is what the passage is trying to communicate. Fulfilled implies a sense of satisfaction from achieving something, complacent suggests contentment without effort or interest, and sufficient implies having enough but not necessarily being satisfied.",
  temperature: 0.25,
  max_tokens: 843,
  top_p: 0.5,
  frequency_penalty: 1,
  presence_penalty: 0.9,
});
*/