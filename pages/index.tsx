import Head from 'next/head'
import Image from 'next/image'
import styles from '@/styles/Home.module.css'
import mainImage from '@/assets/images/sat_image.jpeg'
import { Form, Button, Spinner } from 'react-bootstrap'
import { FormEvent, useState, useEffect, SetStateAction } from 'react'
import ConvertApi from 'convertapi-js'

export default function Home() {

  const [question, setQuestion] = useState("");
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionLoadingError, setQuestionLoadingError] = useState(false);

  const [url, setUrl] = useState("");
  const [urlLoading, seturlLoading] = useState(false);
  const [urlLoadingError, seturlLoadingError] = useState(false);
  
  const [urlData, setUrlData] = useState("");

  const handleTextChange = (event: { target: { value: SetStateAction<string> } }) => {
    setUrlData(event.target.value);
  };

  async function fetchData(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const url = formData.get("url")!.toString().trim();

    if (url) {
      try {
        setUrl("");
        seturlLoadingError(false);
        seturlLoading(true);

        let convertApi = ConvertApi.auth('aCtka8VCDN5R6U3y')
        let params = convertApi.createParams()
        params.add('File', new URL(url));
        let result = await convertApi.convert('pdf', 'txt', params)
        let url_txt = result.files[0].Url
    
        const response = await fetch(url_txt);
        const data = await response.text();
        setUrlData(data);
      } catch (error) {
        console.error(error);
        setQuestionLoadingError(true);
      } finally {
        setQuestionLoading(false);
      }
    }
  
  }

  async function getGPTResponse(e: FormEvent<HTMLFormElement>, prompt_type: string) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const prompt = formData.get(prompt_type)?.toString().trim();
    if (prompt) {
      try {
        setQuestion("");
        setQuestionLoadingError(false);
        setQuestionLoading(true);

        const response = await fetch("/api/cringe?prompt=" + encodeURIComponent(prompt));
        const body = await response.json();
        console.log(body);
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
        <h1>SAT GPT</h1>
        <h2>powered by GPT-3</h2>
        <br />
        <div><h5>Enter a SAT reading question and with its passage and get instant answers</h5></div>
        <br /> 
        <br />
        <div className={styles.mainImageContainer}>
          <Image
            src={mainImage}
            // fill
            alt='main image'
            priority
            className={styles.mainImage}
          />
        </div>
        <br />
        <Form onSubmit={(e) => getGPTResponse(e, "prompt_direct")} className={styles.inputForm}>
          <Form.Group className='mb-3' controlId='prompt-input'>
            <Form.Label>Enter your passage and question here</Form.Label>
            <Form.Control
              name='prompt'
              placeholder='e.g. Akira came directly, breaking all tradition...'
              as="textarea"
              rows={8}
              // maxLength={100}
            />
          </Form.Group>
          <Button type='submit' className='mb-3' disabled={questionLoading}>
            Get Responses
          </Button>
        </Form>
        {questionLoading && <Spinner animation='border' />}
        {questionLoadingError && "Something went wrong. Please try again."}
        {question && <h5>{question}</h5>}
        <br />
        <Form onSubmit={fetchData} className={styles.inputForm}>
          <Form.Group className='mb-3' controlId='url-input'>
            <Form.Label>Or type the URL of your PDF</Form.Label>
            <Form.Control
              name='url'
              placeholder='e.g. https://www.example.com/my-pdf.pdf'
            />
          </Form.Group>
          <Button type='submit' className='mb-3' disabled={questionLoading}>
            Get data
          </Button>
        </Form>
        {questionLoading && <Spinner animation='border' />}
        {questionLoadingError && "Something went wrong. Please try again."}
        <br />
        <Form onSubmit={(e) => getGPTResponse(e, "prompt_url")} className={styles.inputForm}>
          <Form.Group className='mb-3' controlId='prompt-input'>
            <Form.Label>Edit your passages here. <b>Beware of text changes </b>(these free pdf readers aren't always the best...)</Form.Label>
            <Form.Control
              name='prompt'
              placeholder='e.g. Akira came directly, breaking all tradition...'
              as="textarea"
              rows={8}
              value={urlData}
              onChange={handleTextChange}
              // maxLength={100}
            />
          </Form.Group>
          <Button type='submit' className='mb-3' disabled={questionLoading}>
            Submit to model
          </Button>
        </Form>
        {questionLoading && <Spinner animation='border' />}
        {questionLoadingError && "Something went wrong. Please try again."}
        {question && <h5>{question}</h5>}
      </main>
    </>
  )
}