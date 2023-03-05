import Head from 'next/head'
import Image from 'next/image'
import styles from '@/styles/Home.module.css'
import mainImage from '@/assets/images/sat_image.jpeg'
import { Form, Button, Spinner, FormLabel, ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import { FormEvent, useState, SetStateAction } from 'react'
import ConvertApi from 'convertapi-js'

export default function Home() {

  const [question, setQuestion] = useState("");
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionLoadingError, setQuestionLoadingError] = useState(false);

  const [urlData, setUrlData] = useState("");
  const [urlLoading, seturlLoading] = useState(false);
  const [urlLoadingError, seturlLoadingError] = useState(false);
  
  const [urlRequestLoading, seturlRequestLoading] = useState(false);
  const [urlRequestLoadingError, seturlRequestLoadingError] = useState(false);

  const [writingQuestion, setWritingQuestion] = useState(false);

  const [userText, setUserText] = useState("Edit your passages here. Beware of text changes (these free pdf readers aren't always the best...)");

  const [writingPrompt1, setWritingPrompt1] = useState(false);
  const [writingPrompt2, setWritingPrompt2] = useState(false);

  const handleTextChange = (event: { target: { value: SetStateAction<string> } }) => {
    setUrlData(event.target.value);
  };

  function handleWritingPrompt1() {
    setWritingPrompt1(!writingPrompt1);
  }

  function handleWritingPrompt2() {
    setWritingPrompt2(!writingPrompt2);
  }

  function handleWritingChange() {
    setWritingQuestion(!writingQuestion);
    if (writingQuestion) {
      setUserText("Input the passage here (and remove all the whitespace after importing it through the pdf) and give plenty of context for your question. Utilize Ctrl+F to find the question");
    } else {
      setUserText("Edit your passage here. Beware of text changes (these free pdf readers aren't always the best...) and give plenty of context to your question");
    }
    console.log(writingQuestion);
  }

  async function fetchData(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const url = formData.get("url")!.toString().trim();

    if (url) {
      try {
        setUrlData("");
        seturlLoadingError(false);
        seturlLoading(true);

        let convertApi = ConvertApi.auth('aCtka8VCDN5R6U3y')
        try {
          seturlRequestLoadingError(false);
          seturlRequestLoading(true);

          let params = convertApi.createParams()
          params.add('File', new URL(url));
          let result = await convertApi.convert('pdf', 'txt', params)
          let url_txt = result.files[0].Url
      
          const response = await fetch(url_txt);
          const data = await response.text();

          setUrlData(data.trim());
        } catch (error) {
          console.error(error);
          seturlRequestLoadingError(true);
        } finally {
          seturlRequestLoading(false);
        }
      } catch (error) {
        console.error(error);
        seturlLoadingError(true);
      } finally {
        seturlLoading(false);
      }
    }
  
  }

  async function getGPTResponse(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    let prompt = formData.get("prompt")?.toString().trim();
    let replace_word = formData.get("replace_word")?.toString().trim();
    let other_choices = formData.get("other_choices")?.toString().trim();
    replace_word = `${replace_word}`;

    if (prompt) {
      try {
        setQuestion("");
        setQuestionLoadingError(false);
        setQuestionLoading(true);
        if (!writingQuestion) {
          let beg = `You are an expert test-taker about to take the SAT. You will consider how the passage might be edited to correct errors in sentence structure, usage, or punctuation. Choose the answer to each question that most effectively improves the quality of writing in the passage or that makes the passage conform to the conventions of standard written English.\n\nPassage 1\n${prompt}\n`
          if (writingPrompt1) {
            prompt = beg + `Change all instances of the word ${replace_word} with a synonym from the below choices that best maintains the flow of passage 1. Pay attention to the purpose of the passage and which synonym matches up most with it. If the word ${replace_word} is the best word in context, select "A". Output both a letter choice and an explanation of why:\nA) ${replace_word} \n${other_choices}\n`
          } else if (writingPrompt2) {
            prompt = beg + `Choose an answer choice below (a, b, c, d) that best serves as a replacement to the word ${replace_word} in the passage and write the explanation for your chosen answer with and why the other choices are not right with specific english grammar reasoning using this format "choice [insert choice letter here] is not the right answer because ..."\nA) ${replace_word} \n${other_choices}\n`
          }
        } else {
          prompt = `You are the best SAT test-taker and you need to answer questions and send their expert explanations. Forget all background knowledge of this passage:\n
          Question and its passage:\n
          ${prompt}\n
          Enter an Answer and Explanation:\n`
        }
        const response = await fetch("/api/gpt_page?prompt=" + encodeURIComponent(prompt));
        const body = await response.json();
        
        setQuestion(body.question);
      } catch (error) {
        console.error(error);
        setQuestionLoadingError(true);
      } finally {
        setQuestionLoading(false);
      }
    }
  }

  return (
    <>
      <Head>
        <title>SAT GPT - Get answers to your most needed questions</title>
        <meta name="description" content="by Naren Manikandan" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.highlight}>
        <br />
        <h1>SAT GPT</h1>
        <h2>powered by GPT-3</h2>
        <br />
        <div><h5>Enter a SAT reading question and with its passage and get instant answers</h5></div>
        <br /> 
        <br />
        </div>
        <div className={styles.mainImageContainer}>
          <Image
            src={mainImage}
            fill
            alt='main image'
            priority
            className={styles.mainImage}
          />
        </div>

        <br />
        <FormLabel>Pick your question type</FormLabel>
        <ToggleButtonGroup type="checkbox" aria-label="type">
          <ToggleButton className={styles.custom_btn} variant="secondary" value={1} onClick={!writingQuestion ? handleWritingChange : undefined}>Reading</ToggleButton>
          <ToggleButton className={styles.custom_btn} variant="secondary" value={2} onClick={writingQuestion ? handleWritingChange : undefined}>Writing</ToggleButton>
        </ToggleButtonGroup>
        <br />
        <FormLabel>You have selected the {writingQuestion ? "reading" : "writing"} type</FormLabel>      
        <FormLabel>If you want to directly input your text, paste it into the <b>last </b> text box below. </FormLabel>      
        <br />
        {!writingQuestion && <FormLabel>Notice that software works well mainly on question that ask for the best replacement of another word already in the passage and replacing small grammatially-incorrect phrases. </FormLabel>}

        <Form onSubmit={fetchData} className={styles.inputForm}>
          <Form.Group className={styles.highlight} controlId='url-input'>
            <Form.Label>Or type the URL of your PDF and it will appear below</Form.Label>
            <Form.Control
              name='url'
              placeholder='e.g. https://www.example.com/my-pdf.pdf'
            />
          </Form.Group>
          <Button type='submit' className={styles.custom_btn} disabled={questionLoading}>
            Get data
          </Button>
        </Form>
        {urlRequestLoading && <Spinner animation='border' />}
        {urlRequestLoadingError && "Something went wrong. Please try again."}
        
        <br />

        <Form onSubmit={getGPTResponse} className={styles.inputForm}>
          <Form.Group className='mb-3' controlId='prompt-input'>
            <Form.Label>{userText}</Form.Label>
            <Form.Control
              name='prompt'
              placeholder='e.g. Akira came directly, breaking all tradition...'
              as="textarea"
              rows={10}
              value={urlData}
              onChange={handleTextChange}
            />
          </Form.Group>

          <br />

          {!writingQuestion ? (
            <Form.Group className='mb-3' controlId='passage-input'>
              <Form.Label>Enter the word that needs to be replaced (aka, the word kept by "NO CHANGE")</Form.Label>
              <Form.Control
                name='replace_word'
              />
              <br />
              <Form.Label>Enter the rest of the choices</Form.Label>
              <Form.Control
                name='other_choices'
                as='textarea'
                rows={3}
                placeholder={`B) However,\nC) As such,\nD) Moreover,`}
              />
              <br />
              <Form>
                <Form.Check
                  type="radio"
                  label="If your question is asking to replace an existing word using context, select this option."
                  id="radio1"
                  name="writing-prompt"
                  onChange={handleWritingPrompt1}
                />
                <Form.Check
                  type="radio"
                  label="If there is a grammatical error that you need to correct with a phrase, select this option."
                  id="radio2"
                  name="writing-prompt"
                  onChange={handleWritingPrompt2}
                />
              </Form>
            </Form.Group>
          ) : null}
          
          <Button type='submit' className={styles.custom_btn} disabled={questionLoading}>
            Submit to model
          </Button>
        </Form>
        {questionLoading && <Spinner animation='border' />}
        {questionLoadingError && "Something went wrong. Please try again."}
        <br />
        {question && <p>{question}</p>}
      </main>
    </>
  )
}