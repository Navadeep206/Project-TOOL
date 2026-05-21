import { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { toast } from 'sonner';

const Chat = () => {
    const { user } = useAuth();
    const socket = useSocket();
    const [chatList, setChatList] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [typingUsers, setTypingUsers] = useState({}); // { userId: boolean }
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch Chat List
    useEffect(() => {
        const fetchChatList = async () => {
            try {
                const res = await axios.get(`${(import.meta.env.VITE_API_BASE_URL || 'https://project-tool-1.onrender.com/api')}/chat/list`, { withCredentials: true });
                setChatList(res.data.data);
            } catch (error) {
                console.error('Failed to fetch chat list:', error);
                toast.error('Failed to load contacts');
            } finally {
                setIsLoading(false);
            }
        };
        fetchChatList();
    }, []);

    // Fetch Messages when selected user changes
    useEffect(() => {
        if (!selectedUser) return;

        const fetchMessages = async () => {
            try {
                const res = await axios.get(`${(import.meta.env.VITE_API_BASE_URL || 'https://project-tool-1.onrender.com/api')}/chat/${selectedUser._id}`, { withCredentials: true });
                setMessages(res.data.data);
            } catch (error) {
                console.error('Failed to fetch messages:', error);
                toast.error('Failed to load conversation');
            }
        };
        fetchMessages();
    }, [selectedUser]);

    // Socket listeners
    useEffect(() => {
        if (!socket) return;

        socket.on('private:received', ({ message, sender }) => {
            if (selectedUser && String(sender.id) === String(selectedUser._id)) {
                setMessages(prev => [...prev, message]);
            }

            setChatList(prev => prev.map(c => {
                if (String(c._id) === String(sender.id)) {
                    return { ...c, lastMessage: { content: message.content, createdAt: message.createdAt, sender: sender.id } };
                }
                return c;
            }));
        });

        socket.on('private:sent', ({ message }) => {
            setChatList(prev => prev.map(c => {
                if (String(c._id) === String(message.recipient)) {
                    return { ...c, lastMessage: { content: message.content, createdAt: message.createdAt, sender: message.sender } };
                }
                return c;
            }));
        });

        socket.on('private:typing_update', ({ senderId, isTyping }) => {
            setTypingUsers(prev => ({
                ...prev,
                [senderId]: isTyping
            }));
        });

        return () => {
            socket.off('private:received');
            socket.off('private:sent');
            socket.off('private:typing_update');
        };
    }, [socket, selectedUser]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !selectedUser || !socket) return;

        const content = inputText.trim();
        setInputText('');
        setIsSending(true);

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

        setIsSending(false);
        handleTypingStatus(false);
    };

    const handleTypingStatus = (status) => {
        if (!socket || !selectedUser) return;
        socket.emit('private:typing', {
            recipientId: selectedUser._id,
            isTyping: status
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="bg-[#050505] h-[calc(100vh-4rem)] flex overflow-hidden font-sans text-zinc-300">
            {/* Sidebar */}
            <div className="w-80 border-r border-zinc-800/50 flex flex-col bg-[#080808]">
                <div className="p-6 border-b-2 border-zinc-900 flex items-center justify-between">
                    <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-sm shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                        Operatives
                    </h2>
                    <span className="text-[9px] font-black font-mono text-zinc-700 bg-zinc-950 px-2 py-0.5 rounded-sm border border-zinc-900 uppercase tracking-widest">
                        {chatList.length}_UPLINKS
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="p-4 space-y-3">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-16 bg-zinc-900/30 rounded border border-zinc-800/50 animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        chatList.map(contact => (
                            <button
                                key={contact._id}
                                onClick={() => setSelectedUser(contact)}
                                className={`w-full p-4 flex items-center gap-4 border-b border-zinc-900/50 transition-all text-left outline-none relative group ${selectedUser?._id === contact._id ? 'bg-zinc-900/80 shadow-[inset_4px_0_0_0_#f59e0b]' : 'hover:bg-zinc-900/40'}`}
                            >
                                <div className={`w-10 h-10 rounded-sm border flex items-center justify-center font-mono text-[10px] font-black transition-all ${selectedUser?._id === contact._id ? 'bg-zinc-100 border-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-zinc-950 border-zinc-900 text-zinc-600 group-hover:border-zinc-800'}`}>
                                    {contact.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <p className={`text-[11px] font-black truncate uppercase tracking-tight transition-colors ${selectedUser?._id === contact._id ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>{contact.name}</p>
                                        {contact.lastMessage && (
                                            <span className="text-[8px] text-zinc-700 font-black font-mono tracking-widest">
                                                {formatTime(contact.lastMessage.createdAt)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        {typingUsers[contact._id] ? (
                                            <span className="text-[9px] text-amber-500 font-black font-mono animate-pulse uppercase tracking-widest">_Typing...</span>
                                        ) : (
                                            <p className="text-[9px] text-zinc-700 truncate font-bold uppercase tracking-widest">
                                                {contact.lastMessage?.content || `REF: ${contact._id.substring(contact._id.length - 4)}`}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-[#050505] relative">
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 border-b border-zinc-900 px-6 flex items-center justify-between bg-[#050505]/80 backdrop-blur-xl z-20">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-sm bg-zinc-950 border border-zinc-900 flex items-center justify-center font-mono text-amber-500 font-black text-[10px] shadow-lg">
                                    {selectedUser.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-[11px] font-black text-white tracking-[0.2em] uppercase">{selectedUser.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="w-1.5 h-1.5 rounded-sm bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
                                        <p className="text-[8px] font-black font-mono text-zinc-600 uppercase tracking-[0.2em]">{selectedUser.role} • UPLINK_STABLE</p>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center gap-3">
                                <button className="p-2 text-zinc-600 hover:text-zinc-300 transition-colors bg-zinc-900/50 border border-zinc-800 rounded">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </button>
                                <button className="p-2 text-zinc-600 hover:text-zinc-300 transition-colors bg-zinc-900/50 border border-zinc-800 rounded">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(20,20,20,0.5),transparent)]">
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 pointer-events-none">
                                    <div className="w-32 h-px bg-gradient-to-r from-transparent via-zinc-500 to-transparent mb-4"></div>
                                    <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Conversation Intercept Hooked</p>
                                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent mt-4 text-center"></div>
                                </div>
                            )}

                            {messages.map((msg, idx) => {
                                const isOwn = String(msg.sender) === String(user._id);
                                const nextMsg = messages[idx + 1];
                                const isRoundTop = !messages[idx - 1] || String(messages[idx - 1].sender) !== String(msg.sender);
                                const isRoundBottom = !nextMsg || String(nextMsg.sender) !== String(msg.sender);

                                return (
                                    <div key={msg._id || idx} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                                        {isRoundTop && (
                                            <div className="text-[9px] font-mono text-zinc-700 mb-1.5 uppercase tracking-widest px-1">
                                                {isOwn ? 'Authorized Access' : 'External Feed'} • {formatTime(msg.createdAt)}
                                            </div>
                                        )}
                                        <div className={`group relative max-w-[80%] md:max-w-[65%]`}>
                                            <div className={`px-4 py-3 text-[13px] leading-relaxed transition-all shadow-xl ${isOwn
                                                ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-black border border-amber-400/50 shadow-amber-500/10'
                                                : 'bg-[#0a0a0a] border border-zinc-800/80 text-zinc-100 hover:border-zinc-700'} 
                                                ${isRoundTop ? (isOwn ? 'rounded-tl-xl rounded-tr-md' : 'rounded-tr-xl rounded-tl-md') : ''}
                                                ${isRoundBottom ? 'rounded-bl-xl rounded-br-xl' : ''}
                                                ${!isRoundTop && !isRoundBottom ? 'rounded-md' : ''}
                                            `}>
                                                {msg.content}
                                            </div>
                                            {isRoundBottom && (
                                                <div className={`absolute -bottom-5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[8px] font-mono text-zinc-600 ${isOwn ? 'right-0' : 'left-0'}`}>
                                                    STATUS: DELIVERED // SIG: {msg._id?.substring(0, 8)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-8 border-t border-zinc-900 bg-[#080808]/80 backdrop-blur-xl">
                            <form onSubmit={handleSendMessage} className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 to-zinc-800/20 rounded blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                                <div className="relative flex gap-3">
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => {
                                            setInputText(e.target.value);
                                            handleTypingStatus(e.target.value.length > 0);
                                        }}
                                        onBlur={() => handleTypingStatus(false)}
                                        placeholder={`Secure transmission to ${selectedUser.name.split(' ')[0]}...`}
                                        className="flex-1 bg-black border border-zinc-800 rounded px-5 py-4 text-zinc-100 focus:outline-none focus:border-amber-500/50 transition-all font-mono text-sm placeholder:text-zinc-700 tracking-tight"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!inputText.trim() || isSending}
                                        className="bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-900 disabled:text-zinc-700 text-black font-black uppercase text-[11px] tracking-[0.2em] px-8 rounded transition-all shadow-lg active:scale-95 flex items-center gap-2"
                                    >
                                        EXECUTE
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                                    </button>
                                </div>
                            </form>
                            <div className="mt-3 flex justify-between items-center px-1">
                                <div className="flex items-center gap-3">
                                    <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest flex items-center gap-2 group-focus-within:text-zinc-500 transition-colors">
                                        <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
                                        E2EE_ENCRYPTION: AES_256_GCM
                                    </p>
                                    {isSending && <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></div>}
                                </div>
                                {typingUsers[selectedUser._id] && (
                                    <p className="text-[10px] font-mono text-amber-500/80 italic uppercase tracking-wider flex items-center gap-2">
                                        <span className="flex gap-0.5">
                                            <span className="w-1 h-1 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-1 h-1 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-1 h-1 bg-amber-500 rounded-full animate-bounce"></span>
                                        </span>
                                        Operative Typing
                                    </p>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-20 bg-[radial-gradient(circle_at_center,rgba(40,40,40,0.1)_0%,transparent_70%)]">
                        <div className="relative mb-10">
                            <div className="absolute -inset-8 bg-amber-500/5 rounded-full blur-2xl animate-pulse"></div>
                            <div className="w-24 h-24 bg-black border-2 border-zinc-900 rounded-sm flex items-center justify-center relative z-10 box-glow">
                                <span className="text-4xl text-amber-500 font-mono font-black animate-pulse group-hover:scale-110 transition-transform tracking-tight">_PT</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-[0.3em] mb-4">Initialize Link</h3>
                        <p className="text-zinc-500 font-mono text-[11px] max-w-sm leading-loose uppercase tracking-[0.2em]">
                            Select an operative from the left terminal to establish an encrypted satellite uplink. Unauthorized access is prohibited.
                        </p>
                        <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-md opacity-20">
                            <div className="h-0.5 bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
                            <div className="h-0.5 bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #27272a;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #3f3f46;
                }
                .box-glow {
                    box-shadow: inset 0 0 20px rgba(245,158,11,0.05), 0 0 30px rgba(0,0,0,0.5);
                }
            `}} />
        </div>
    );
};

export default Chat;
