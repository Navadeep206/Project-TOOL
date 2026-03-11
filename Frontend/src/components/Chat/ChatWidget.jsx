import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { MessageSquare, X, Minus, Send, User, ChevronLeft, Search } from 'lucide-react';
import { toast } from 'sonner';

const ChatWidget = () => {
    const { user } = useAuth();
    const socket = useSocket();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [chatList, setChatList] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen && !isMinimized) {
            scrollToBottom();
        }
    }, [messages, isOpen, isMinimized]);

    // Fetch Chat List
    useEffect(() => {
        if (!isOpen) return;
        const fetchChatList = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/chat/list`, { withCredentials: true });
                setChatList(res.data.data);
            } catch (error) {
                console.error('Failed to fetch chat list:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchChatList();
    }, [isOpen]);

    // Fetch Messages
    useEffect(() => {
        if (!selectedUser || !isOpen) return;
        const fetchMessages = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/chat/${selectedUser._id}`, { withCredentials: true });
                setMessages(res.data.data);
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            }
        };
        fetchMessages();
    }, [selectedUser, isOpen]);

    // Socket listeners
    useEffect(() => {
        if (!socket) return;

        socket.on('private:received', ({ message, sender }) => {
            if (selectedUser && String(sender.id) === String(selectedUser._id)) {
                setMessages(prev => [...prev, message]);
            }
            // Update chat list for last message
            setChatList(prev => prev.map(c =>
                String(c._id) === String(sender.id)
                    ? { ...c, lastMessage: { content: message.content, createdAt: message.createdAt } }
                    : c
            ));
        });

        return () => socket.off('private:received');
    }, [socket, selectedUser]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !selectedUser || !socket) return;

        const content = inputText.trim();
        setInputText('');

        const tempMsg = {
            _id: Date.now().toString(),
            sender: user._id,
            recipient: selectedUser._id,
            content,
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);

        socket.emit('private:message', {
            recipientId: selectedUser._id,
            content
        });
    };

    if (!user) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className={`mb-4 w-80 sm:w-96 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right ${isMinimized ? 'h-14' : 'h-[500px]'}`}>
                    {/* Header */}
                    <div className="p-4 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {selectedUser && !isMinimized && (
                                <button onClick={() => setSelectedUser(null)} className="p-1 hover:bg-zinc-800 rounded text-zinc-400">
                                    <ChevronLeft size={16} />
                                </button>
                            )}
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                                    {selectedUser ? selectedUser.name : 'Messages'}
                                </h3>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-500">
                                <Minus size={16} />
                            </button>
                            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-500">
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <div className="flex-1 flex flex-col min-h-0 bg-[#09090b]">
                            {!selectedUser ? (
                                /* Contact List */
                                <div className="flex-1 overflow-y-auto">
                                    {chatList.map(contact => (
                                        <button
                                            key={contact._id}
                                            onClick={() => setSelectedUser(contact)}
                                            className="w-full p-4 flex items-center gap-3 hover:bg-zinc-900/50 border-b border-zinc-900/50 transition-colors text-left"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 text-xs font-bold shrink-0">
                                                {contact.name[0].toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-zinc-200 truncate">{contact.name}</p>
                                                <p className="text-[10px] text-zinc-500 truncate font-mono">
                                                    {contact.lastMessage?.content || 'Start a conversation'}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                    {chatList.length === 0 && !isLoading && (
                                        <div className="p-8 text-center text-zinc-600">
                                            <p className="text-xs font-mono uppercase tracking-widest">No operatives found</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Messages */
                                <>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {messages.map((msg, idx) => {
                                            const isOwn = String(msg.sender) === String(user._id);
                                            return (
                                                <div key={msg._id || idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed shadow-lg ${isOwn
                                                        ? 'bg-amber-500 text-black font-medium'
                                                        : 'bg-zinc-900 text-zinc-200 border border-zinc-800'}`}>
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                    <form onSubmit={handleSendMessage} className="p-4 bg-zinc-900/30 border-t border-zinc-800">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={inputText}
                                                onChange={(e) => setInputText(e.target.value)}
                                                placeholder="Type a message..."
                                                className="flex-1 bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500/50 transition-all font-mono"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!inputText.trim()}
                                                className="p-2 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black rounded-lg transition-all"
                                            >
                                                <Send size={16} />
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Float Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-amber-500 hover:bg-amber-400 text-black rounded-full shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
                >
                    <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-black border-2 border-amber-500 rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                    </div>
                </button>
            )}
        </div>
    );
};

export default ChatWidget;
