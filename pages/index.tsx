import Head from 'next/head'
import Image from 'next/image'
import styles from '@/styles/Home.module.css'
import mainImage from '@/assets/images/sat_image.jpeg'
import { Form, Button, Spinner, ButtonGroup, FormLabel, ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import { FormEvent, useState, SetStateAction } from 'react'
import ConvertApi from 'convertapi-js'

export default function Home() {

  const [quote, setQuote] = useState("");
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteLoadingError, setQuoteLoadingError] = useState(false);

  const [urlData, setUrlData] = useState("");
  const [urlLoading, seturlLoading] = useState(false);
  const [urlLoadingError, seturlLoadingError] = useState(false);
  
  const [urlRequestLoading, seturlRequestLoading] = useState(false);
  const [urlRequestLoadingError, seturlRequestLoadingError] = useState(false);

  const [writingQuestion, setWritingQuestion] = useState(false);

  const [userText, setUserText] = useState("Edit your passages here. Beware of text changes (these free pdf readers aren't always the best...)");

  const handleTextChange = (event: { target: { value: SetStateAction<string> } }) => {
    setUrlData(event.target.value);
  };

  function handleWritingChange() {
    setWritingQuestion(!writingQuestion);
    if (writingQuestion) {
      setUserText("Input the passage here and your question in the next text box");
    } else {
      setUserText("Edit your passages here. Beware of text changes (these free pdf readers aren't always the best...)");
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
    const prompt = formData.get("prompt")?.toString().trim();

    console.log(prompt);

    if (prompt) {
      try {
        setQuote("");
        setQuoteLoadingError(false);
        setQuoteLoading(true);
        
        const response = await fetch("/api/gpt_page?prompt=" + encodeURIComponent(prompt));
        const body = await response.json();

        setQuote(body.quote);
      } catch (error) {
        console.error(error);
        setQuoteLoadingError(true);
      } finally {
        setQuoteLoading(false);
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

        <Form onSubmit={fetchData} className={styles.inputForm}>
          <Form.Group className={styles.highlight} controlId='url-input'>
            <Form.Label>Or type the URL of your PDF</Form.Label>
            <Form.Control
              name='url'
              placeholder='e.g. https://www.example.com/my-pdf.pdf'
            />
          </Form.Group>
          <Button type='submit' className={styles.custom_btn} disabled={quoteLoading}>
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
              rows={8}
              value={urlData}
              onChange={handleTextChange}
            />
          </Form.Group>

          <br />

          {!writingQuestion ? (
            <Form.Group className='mb-3' controlId='passage-input'>
              <Form.Label>Input the question here</Form.Label>
              <Form.Control
                name='question'
                as='textarea'
                rows={3}
                placeholder='Which choice best describes...'
              />
            </Form.Group>
          ) : null}
          
          <br />

          <Button type='submit' className={styles.custom_btn} disabled={quoteLoading}>
            Submit to model
          </Button>
        </Form>
        {quoteLoading && <Spinner animation='border' />}
        {quoteLoadingError && "Something went wrong. Please try again."}
        {quote && <h5>{quote}</h5>}
      </main>
    </>
  )
}