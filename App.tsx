import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToGemini } from './services/geminiService';
import { Message, SendingStatus } from './types';

// Copy Button Component
const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-2 rounded-lg transition-all duration-300 ease-in-out group ${
        copied 
          ? 'bg-green-500/20 text-green-400' 
          : 'bg-black/20 text-zinc-400 hover:bg-black/40 hover:text-white'
      }`}
      title="Copy to clipboard"
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 transform group-hover:scale-110 transition-transform">
          <path fillRule="evenodd" d="M17.663 3.118c.225.015.45.032.673.05C19.876 3.298 21 4.604 21 6.109v9.642a3 3 0 01-3 3V16.5c0-5.922-4.576-10.775-10.384-11.217.324-1.132 1.3-2.01 2.548-2.114.224-.019.448-.036.673-.051A3 3 0 0113.5 1.5H15a3 3 0 012.663 1.618zM12 4.5A1.5 1.5 0 0113.5 3H15a1.5 1.5 0 011.5 1.5H12z" clipRule="evenodd" />
          <path fillRule="evenodd" d="M3 8.625c0-1.036.84-1.875 1.875-1.875h.375A3.75 3.75 0 019 10.5v1.875c0 1.036.84 1.875 1.875 1.875h1.875A3.75 3.75 0 0116.5 18v2.625c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625v-12zM10.5 10.5a1.875 1.875 0 00-1.875 1.875V16.5c0 1.035.84 1.875 1.875 1.875h3A1.875 1.875 0 0015.375 16.5v-3.75a3.375 3.375 0 00-3.375-3.375h-1.5z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
};

// Regenerate Button Component
const RegenerateButton: React.FC<{ onClick: () => void; disabled: boolean }> = ({ onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-lg transition-all duration-300 ease-in-out group ${
        disabled
          ? 'opacity-50 cursor-not-allowed text-zinc-600'
          : 'bg-black/20 text-zinc-400 hover:bg-black/40 hover:text-white'
      }`}
      title="Regenerate Ad"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={`w-5 h-5 ${disabled ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`}
      >
        <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.919z" clipRule="evenodd" />
      </svg>
    </button>
  );
};

// Auto-resizing Textarea Component for Editable AI Response
const EditableResponse: React.FC<{ text: string; onChange: (newText: string) => void }> = ({ text, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  return (
    <textarea
      ref={textareaRef}
      value={text}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-transparent border-none outline-none resize-none p-0 m-0 text-zinc-200 placeholder-zinc-500 font-inherit leading-relaxed overflow-hidden"
      spellCheck="false"
      rows={1}
    />
  );
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<SendingStatus>(SendingStatus.Idle);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setStatus(SendingStatus.Sending);

    try {
      const responseText = await sendMessageToGemini(userMessage.text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setStatus(SendingStatus.Idle);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Error processing ad. Please check the system logs.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setStatus(SendingStatus.Error);
    }
  };

  const handleRegenerate = async (messageId: string, promptText: string) => {
    if (status === SendingStatus.Sending) return;
    setStatus(SendingStatus.Sending);

    try {
      const responseText = await sendMessageToGemini(promptText);
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
            return {
                ...msg,
                text: responseText,
                timestamp: new Date()
            };
        }
        return msg;
      }));
      setStatus(SendingStatus.Idle);
    } catch (error) {
        console.error("Regeneration failed", error);
        setStatus(SendingStatus.Error);
    }
  };
  
  const handleMessageChange = (id: string, newText: string) => {
    setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, text: newText } : msg
    ));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-zinc-100 font-sans overflow-hidden">
      {/* Header */}
      <header className="flex-none bg-zinc-900 border-b border-red-900/30 p-4 shadow-lg z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center font-bold text-xl shadow-red-900/50 shadow-lg text-white">
                LI
             </div>
             <div>
                 <h1 className="text-xl font-bold tracking-tight text-white">LIFEINVADER <span className="text-red-600">AI</span></h1>
                 <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Internal Ad Systems</p>
             </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-700">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
             </span>
             SYSTEM ONLINE
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-8"> 
            {messages.length === 0 && (
                <div className="text-center mt-20 opacity-50 select-none animate-in fade-in zoom-in duration-500">
                    <div className="text-7xl mb-6 text-zinc-800 flex justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24">
                            <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-zinc-600 tracking-tight">Ready to Edit</h2>
                    <p className="text-zinc-500 mt-2 text-lg">Paste raw ad text below for instant processing.</p>
                </div>
            )}
            
            {messages.map((msg, index) => {
              const previousMessage = index > 0 ? messages[index - 1] : null;
              const promptText = previousMessage?.role === 'user' ? previousMessage.text : null;
              
              return (
                <div
                key={msg.id}
                className={`flex w-full group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                <div
                    className={`relative p-5 sm:p-6 rounded-2xl shadow-xl text-base md:text-lg leading-relaxed transition-all duration-200 ${
                    msg.role === 'user'
                        ? 'max-w-[85%] md:max-w-[75%] bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-br-none hover:border-zinc-600 whitespace-pre-wrap'
                        : 'w-full max-w-[98%] md:max-w-[95%] bg-gradient-to-br from-red-600/10 to-zinc-900 border border-red-900/30 text-zinc-200 rounded-bl-none hover:border-red-900/50 hover:shadow-red-900/10'
                    }`}
                >
                    {msg.role === 'model' && (
                        <>
                            <div className="absolute -top-3 left-0 bg-zinc-900 text-[10px] text-red-500 px-2 py-0.5 border border-red-900/30 rounded-full uppercase tracking-wider font-bold shadow-sm">
                                AI Edited (Editable)
                            </div>
                            <div className="absolute top-3 right-3 flex gap-2 z-10">
                                {promptText && (
                                    <RegenerateButton 
                                        onClick={() => handleRegenerate(msg.id, promptText)}
                                        disabled={status === SendingStatus.Sending}
                                    />
                                )}
                                <CopyButton text={msg.text} />
                            </div>
                        </>
                    )}
                    <div className={msg.role === 'model' ? 'pr-20 pt-1' : ''}>
                        {msg.role === 'model' ? (
                            <EditableResponse 
                                text={msg.text} 
                                onChange={(newText) => handleMessageChange(msg.id, newText)} 
                            />
                        ) : (
                            msg.text
                        )}
                    </div>
                </div>
                </div>
              );
            })}
            
            {status === SendingStatus.Sending && (
                <div className="flex justify-start w-full animate-pulse">
                    <div className="bg-zinc-800/50 p-6 rounded-2xl rounded-bl-none border border-zinc-700/50 min-w-[300px]">
                        <div className="flex gap-2 items-center h-5">
                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce delay-0"></div>
                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce delay-150"></div>
                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce delay-300"></div>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-none p-4 md:p-6 bg-zinc-900 border-t border-zinc-800/50 z-10 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-5xl mx-auto">
            <div className="relative flex items-end gap-2 bg-zinc-800/80 p-2 rounded-xl border border-zinc-700 focus-within:border-red-600/50 focus-within:ring-1 focus-within:ring-red-600/20 transition-all shadow-lg">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type or paste your raw ad here..."
                    className="w-full bg-transparent text-white placeholder-zinc-500 resize-none outline-none p-4 max-h-40 min-h-[60px] custom-scrollbar text-lg"
                    rows={1}
                />
                <button
                    onClick={handleSend}
                    disabled={status === SendingStatus.Sending || !input.trim()}
                    className={`p-4 rounded-lg flex-none transition-all duration-200 mb-0.5 ${
                        input.trim() 
                        ? 'bg-red-600 text-white hover:bg-red-500 hover:scale-105 shadow-lg shadow-red-900/30 active:scale-95' 
                        : 'bg-zinc-700 text-zinc-500 cursor-not-allowed opacity-50'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                </button>
            </div>
            <div className="text-center mt-3 pb-1">
                <p className="text-[10px] text-zinc-600 font-medium tracking-widest uppercase">
                    Designed by Samaksh Adachi
                </p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;