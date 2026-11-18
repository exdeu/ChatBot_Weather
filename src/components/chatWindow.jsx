import { useEffect, useRef, useState } from 'react';
import ChatInput from './chatinput';
import ChatMessage from './chatmessage';
import { askAI } from '../services/gemini';
import '../css/chatbot.css';
const initialMessages = [
  {
    role: 'assistant',
    content: 'Hello! I am your AI assistant. Ask me anything.',
  },
];

const ChatWindow = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (text) => {
    if (!text) {
      return;
    }

    const userMessage = { role: 'user', content: text };
    const conversation = [...messages, userMessage];

    setMessages(conversation);
    setIsLoading(true);

    try {
      const aiReply = await askAI(conversation.filter((message) => !message.isError));
      setMessages([...conversation, { role: 'assistant', content: aiReply }]);
    } catch (error) {
      setMessages([
        ...conversation,
        {
          role: 'assistant',
          content: error.message || 'Sorry, I could not contact the AI service right now.',
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="chat-window-card">
      <div className="chat-window-header">
        <div>
          <h2>AI Chatbot</h2>
          <p>Powered by Hugging Face</p>
        </div>
      </div>

      <div className="chat-window-messages">
        {messages.map((message, index) => (
          <ChatMessage key={`${message.role}-${index}`} message={message} />
        ))}

        {isLoading && (
          <div className="chat-message assistant">
            <div className="chat-bubble typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <ChatInput onSendMessage={sendMessage} disabled={isLoading} />
    </section>
  );
};

export default ChatWindow;
