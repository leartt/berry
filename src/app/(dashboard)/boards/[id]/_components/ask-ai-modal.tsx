import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Textarea } from '@/components/ui/textarea';
import { RequiredModalProps } from '@/lib/types';
import { Bot } from 'lucide-react';
import { parse } from 'partial-json';
import { ElementRef, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { toast } from 'react-toastify';
import { useSessionStorage } from 'usehooks-ts';

interface Props extends RequiredModalProps {}

export default function AskAiModal({ isOpen, closeModal }: Props) {
  const [
    chatMessagesStorage,
    setChatMessagesStorage,
    removeChatMessagesStorage,
  ] = useSessionStorage('chat-messages', '');

  const formRef = useRef<ElementRef<'form'>>(null);
  const [chatHistory, setChatHistory] = useState<
    { role: string; content: string }[]
  >(
    chatMessagesStorage
      ? () => JSON.parse(chatMessagesStorage)
      : [{ role: 'system', content: 'You are a helpful assistant.' }]
  );

  const [latestMessage, setLatestMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const endOfMessagesRef = useRef<ElementRef<'div'>>(null);

  const handleGPT = async (formData: FormData) => {
    const prompt = (formData.get('prompt') as string).trim();

    if (!prompt) {
      toast('Please enter a prompt', { type: 'error' });
      return;
    }

    const newChatHistory = [...chatHistory, { role: 'user', content: prompt }];
    setChatMessagesStorage(JSON.stringify(newChatHistory));

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
          const newChat = [
            ...chatHistory,
            { role: 'assistant', content: incomingMessage },
          ];
          setChatHistory((prevChatHistory) => {
            const newChat = [
              ...prevChatHistory,
              { role: 'assistant', content: incomingMessage },
            ];
            setChatMessagesStorage(JSON.stringify(newChat));
            return newChat;
          });
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === ' ') {
      e.stopPropagation();
    }

    if (e.altKey || e.ctrlKey || e.shiftKey) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  useEffect(() => {
    if (endOfMessagesRef.current) {
      console.log('endOfMessagesRef.current', endOfMessagesRef.current);
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isStreaming, chatHistory]);

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent
        className="w-full bg-white p-4"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Ask AI</DialogTitle>
          <DialogDescription>
            Enter your question and our AI will provide an answer.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[350px] h-fit flex flex-col gap-2">
          <div className="flex-1 space-y-4 overflow-auto py-2 text-sm">
            {chatHistory.map((chat, index) => (
              <>
                {chat.role === 'user' && (
                  <p
                    className="w-fit ml-auto rounded-xl px-4 py-2 bg-secondary text-right whitespace-pre-wrap"
                    key={index}
                  >
                    {chat.content}
                  </p>
                )}
                {chat.role === 'assistant' && (
                  <div className="flex items-start justify-start gap-2">
                    <div>
                      <Bot className="w-6 h-6" />
                    </div>
                    <p
                      className="overflow-auto whitespace-pre-wrap"
                      key={index}
                    >
                      {chat.content}
                    </p>
                  </div>
                )}
              </>
            ))}
            {latestMessage && (
              <div className="flex items-start justify-start gap-2">
                <div>
                  <Bot className="w-6 h-6" />
                </div>
                <p className="whitespace-pre-wrap">{latestMessage}</p>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>
          <form action={handleGPT} ref={formRef}>
            <div className="flex gap-[8px] border-input rounded-lg">
              <Textarea
                name="prompt"
                onKeyDown={handleKeyDown}
                placeholder="Message BerryAI"
                className="w-full min-h-10 h-10 max-h-20 resize-none"
              />
              <Button disabled={isStreaming}>Ask</Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
