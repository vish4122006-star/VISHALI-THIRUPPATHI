import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import type { Course } from '../types';
import { Bot, X } from './icons';

interface AiAssistantProps {
    course: Course | null;
}

type Message = {
    role: 'user' | 'model';
    content: string;
};

export const AiAssistant: React.FC<AiAssistantProps> = ({ course }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            let systemInstruction = "You are an AI assistant helping a user create an online course. Be helpful and provide suggestions to improve the course content, structure, or activities.";
            if (course) {
                systemInstruction += ` The user is currently working on a course titled '${course.title}'. Here is the course description: ${course.description}`;
            }
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction },
            });
            setMessages([{ role: 'model', content: "Welcome! How can I help you refine your course?" }]);
        } else {
            // Clear messages when closing
            setMessages([]);
            setInputValue('');
        }
    }, [isOpen, course]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading || !chatRef.current) return;

        const userMessage: Message = { role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await chatRef.current.sendMessage({ message: userMessage.content });
            const modelMessage: Message = { role: 'model', content: response.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("AI Assistant error:", error);
            const errorMessage: Message = { role: 'model', content: "Sorry, I encountered an error. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 bg-fuchsia-600 text-white p-4 rounded-full shadow-lg shadow-fuchsia-600/50 hover:bg-fuchsia-700 transition-transform hover:scale-110 animate-pulse"
                aria-label="Open AI Assistant"
            >
                <Bot className="w-8 h-8" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-end p-0 sm:p-8">
                    <div className="w-full h-full sm:h-2/3 sm:max-w-md bg-gray-900/80 border border-fuchsia-500 rounded-lg shadow-2xl shadow-fuchsia-500/30 flex flex-col">
                        <header className="flex items-center justify-between p-4 border-b border-fuchsia-500/50">
                            <div className="flex items-center gap-3">
                                <Bot className="w-6 h-6 text-fuchsia-400" />
                                <h2 className="text-lg font-bold text-white">AI Assistant</h2>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </header>
                        <main className="flex-1 p-4 overflow-y-auto text-gray-300 space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="px-4 py-2 rounded-lg bg-gray-700 text-gray-200">
                                        <span className="animate-pulse">AI is typing...</span>
                                    </div>
                                </div>
                            )}
                             <div ref={messagesEndRef} />
                        </main>
                        <footer className="p-4 border-t border-fuchsia-500/50">
                            <form onSubmit={handleSendMessage}>
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Type your message..."
                                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                                    disabled={isLoading}
                                />
                            </form>
                        </footer>
                    </div>
                </div>
            )}
        </>
    );
};