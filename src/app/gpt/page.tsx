'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ElementRef, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { parse } from 'partial-json';

export default function GPTPage() {
  const formRef = useRef<ElementRef<'form'>>(null);
  const [chatHistory, setChatHistory] = useState<
    { role: string; content: string }[]
  >([{ role: 'system', content: 'You are a helpful assistant.' }]);
  const [latestMessage, setLatestMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  const handleGPT = async (formData: FormData) => {
    const prompt = formData.get('prompt') as string;

    const newChatHistory = [...chatHistory, { role: 'user', content: prompt }];

    // todo - leave a comment to explain why this is needed
    flushSync(() => {
      setChatHistory(newChatHistory);
    });

    formRef.current?.reset();

    const response = await fetch('/api/ai/text-generation', {
      method: 'POST',
      body: JSON.stringify({ chatHistory: newChatHistory }),
    });

    if (response.body) {
      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();

      let incomingMessage = '';
      setIsStreaming(true);

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          // Insert the response received into the messages state
          // Reset the latest message's state received
          setChatHistory((prevChatHistory) => [
            ...prevChatHistory,
            { role: 'assistant', content: incomingMessage },
          ]);
          setLatestMessage('');
          setIsStreaming(false);
          break;
        }
        if (value) {
          if (value === 'data: [DONE]') {
            console.log('CHUNKY', value);
            break;
          }

          console.log(value);

          if (value.startsWith('data: ')) {
            const data = parse(value.slice(6));

            setLatestMessage(incomingMessage);
            if (data.response) {
              incomingMessage += data.response;
              setLatestMessage(incomingMessage);
            }
          } else {
            if (value.includes(`"p"`)) {
              const index = value.indexOf(`"p"`);
              if (index > 1) {
                incomingMessage += value.slice(0, index - 2);
              }
            }
          }
        }
      }
    }
  };

  return (
    <div className="max-w-3xl w-full overflow-auto h-[600px]">
      <div>
        {chatHistory.map((message, index) => (
          <p className="overflow-auto whitespace-pre-wrap" key={index}>
            <strong>{message.role}</strong>: <br></br>
            {message.content}
          </p>
        ))}
      </div>
      {/* Display the latest message separately for real-time feedback */}
      {latestMessage && (
        <p className="overflow-auto whitespace-pre-wrap">
          <strong>assistant</strong>: <br />
          {latestMessage}
        </p>
      )}
      <form action={handleGPT} ref={formRef}>
        <Input placeholder="Type something..." name="prompt" />
        <Button type="submit" disabled={isStreaming}>
          Submit
        </Button>
      </form>
    </div>
  );
}
