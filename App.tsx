import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToGemini } from './services/geminiService';
import { getUsers, saveUser, getRequests, createRequest, updateRequestStatus, updateUserRole, updateUserStatus, logUsage, updateTotalTime, getLogs, saveFeedback, getFeedback } from './services/dataService';
import { Message, SendingStatus, User, UserRole, AccessRequest, UsageLog, Feedback } from './types';

// --- ICONS ---
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.746 3.746 0 011.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>;
const UserGroupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>;
const LockClosedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>;
const SparkleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM9 15a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5A.75.75 0 019 15z" clipRule="evenodd" /></svg>;
const BanIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const FeedbackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>;

// --- REUSABLE COMPONENTS ---

const NeonCard: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-xl p-6 shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:border-cyan-500/40 transition-all ${className}`}>
    {children}
  </div>
);

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className={`p-2 rounded-lg transition-all ${copied ? 'text-green-400' : 'text-zinc-400 hover:text-white'}`}>
      {copied ? <span className="text-xs">Copied!</span> : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
    </button>
  );
};

const EditableResponse: React.FC<{ text: string; onChange: (newText: string) => void }> = ({ text, onChange }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [text]);
    return <textarea ref={textareaRef} value={text} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent border-none outline-none resize-none p-0 text-zinc-200 placeholder-zinc-500 font-inherit leading-relaxed" rows={1} />;
};

// --- AUTH COMPONENT ---

const AuthScreen: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

    const handleOwnerLogin = () => {
        if (name === 'Samaksh_Adachi' && password === '9542') {
            const users = getUsers();
            let owner = users.find(u => u.username === 'Samaksh_Adachi');
            if (!owner) {
                // Fail-safe if Init didn't run
                owner = { id: 'owner', username: 'Samaksh_Adachi', role: 'OWNER', status: 'APPROVED', joinedAt: Date.now(), lastActiveAt: Date.now(), totalTimeSpent: 0 };
                saveUser(owner);
            }
            logUsage(owner.id, owner.username, 'LOGIN');
            onLogin(owner);
        } else {
            setError('Invalid Owner Credentials');
        }
    };

    const handleUserRegister = () => {
        if (!name.trim()) return setError('Name Required');
        if (name === 'Samaksh_Adachi') return setError('This name is reserved.');
        
        const users = getUsers();
        const existing = users.find(u => u.username.toLowerCase() === name.toLowerCase());
        
        if (existing) {
            if (existing.status === 'PENDING') return setError('Request already pending.');
            if (existing.status === 'REJECTED' || existing.status === 'BANNED') return setError('Access Denied permanently.');
            // Allow login if exists
            logUsage(existing.id, existing.username, 'LOGIN');
            onLogin(existing);
        } else {
            // New Registration
            const newUser: User = {
                id: Date.now().toString(),
                username: name,
                role: 'USER',
                status: 'PENDING',
                joinedAt: Date.now(),
                lastActiveAt: Date.now(),
                totalTimeSpent: 0
            };
            saveUser(newUser);
            createRequest(newUser);
            logUsage(newUser.id, newUser.username, 'LOGIN');
            onLogin(newUser);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden font-sans text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 animate-[shimmer_2s_infinite]"></div>
            
            <NeonCard className="w-[400px] z-10 flex flex-col gap-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">LIFEINVADER AI</h1>
                    <p className="text-xs text-cyan-500/70 tracking-[0.3em] uppercase mt-2">Secure Access Terminal</p>
                </div>

                <div className="flex gap-2 p-1 bg-black/50 rounded-lg">
                    <button onClick={() => {setMode('LOGIN'); setError('');}} className={`flex-1 py-2 text-sm rounded-md transition-all ${mode === 'LOGIN' ? 'bg-cyan-900/50 text-cyan-300 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>Owner Access</button>
                    <button onClick={() => {setMode('REGISTER'); setError('');}} className={`flex-1 py-2 text-sm rounded-md transition-all ${mode === 'REGISTER' ? 'bg-purple-900/50 text-purple-300 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>User Access</button>
                </div>

                {mode === 'LOGIN' ? (
                    <div className="space-y-4">
                        <input type="text" placeholder="Identity" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/50 border border-zinc-800 focus:border-cyan-500 rounded-lg px-4 py-3 outline-none transition-all text-cyan-100 placeholder-zinc-700" />
                        <input type="password" placeholder="Passcode" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/50 border border-zinc-800 focus:border-cyan-500 rounded-lg px-4 py-3 outline-none transition-all text-cyan-100 placeholder-zinc-700" />
                        <button onClick={handleOwnerLogin} className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-bold py-3 rounded-lg transition-all shadow-[0_0_15px_rgba(8,145,178,0.5)]">AUTHENTICATE</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                         <input type="text" placeholder="Enter Your Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/50 border border-zinc-800 focus:border-purple-500 rounded-lg px-4 py-3 outline-none transition-all text-purple-100 placeholder-zinc-700" />
                         <button onClick={handleUserRegister} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition-all shadow-[0_0_15px_rgba(147,51,234,0.5)]">REQUEST ACCESS</button>
                    </div>
                )}
                {error && <div className="text-red-500 text-xs text-center uppercase tracking-widest animate-pulse">{error}</div>}
            </NeonCard>
        </div>
    );
};

// --- PENDING SCREEN ---
const PendingScreen: React.FC = () => (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white relative">
        <div className="w-24 h-24 rounded-full border-4 border-red-900/30 flex items-center justify-center mb-6 animate-pulse">
            <LockClosedIcon />
        </div>
        <h2 className="text-2xl font-bold text-red-500 tracking-widest">ACCESS RESTRICTED</h2>
        <p className="text-zinc-500 mt-2">Your role request is pending approval by High Command.</p>
        <div className="mt-8 flex gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-75"></span>
            <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-150"></span>
        </div>
        <button onClick={() => window.location.reload()} className="mt-8 text-xs text-zinc-600 hover:text-white transition-colors uppercase">Refresh Status</button>
    </div>
);

// --- FEEDBACK MODAL ---
const FeedbackModal: React.FC<{ isOpen: boolean; onClose: () => void; currentUser: User }> = ({ isOpen, onClose, currentUser }) => {
    const [feedbackText, setFeedbackText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!feedbackText.trim()) return;
        setIsSubmitting(true);
        const feedback: Feedback = {
            id: Date.now().toString(),
            userId: currentUser.id,
            username: currentUser.username,
            text: feedbackText,
            timestamp: Date.now()
        };
        saveFeedback(feedback);
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setFeedbackText('');
                onClose();
            }, 1500);
        }, 800);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <NeonCard className="w-full max-w-md bg-zinc-900 border-purple-500/30">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-purple-400">SUBMIT FEEDBACK</h3>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white">✕</button>
                </div>
                {submitted ? (
                    <div className="text-center py-8">
                        <div className="text-green-400 text-4xl mb-2 flex justify-center"><CheckCircleIcon /></div>
                        <p className="text-white font-bold">Received.</p>
                        <p className="text-zinc-500 text-sm">Thank you for your input.</p>
                    </div>
                ) : (
                    <>
                        <textarea
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder="Report bugs, suggest features, or share your thoughts..."
                            className="w-full bg-black/50 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-600 focus:border-purple-500 outline-none h-32 resize-none mb-4"
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={onClose} className="px-4 py-2 text-zinc-400 hover:text-white text-sm">Cancel</button>
                            <button 
                                onClick={handleSubmit} 
                                disabled={isSubmitting || !feedbackText.trim()}
                                className={`px-4 py-2 rounded text-sm font-bold transition-all ${
                                    isSubmitting || !feedbackText.trim()
                                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                    : 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/50 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                                }`}
                            >
                                {isSubmitting ? 'TRANSMITTING...' : 'SEND FEEDBACK'}
                            </button>
                        </div>
                    </>
                )}
            </NeonCard>
        </div>
    );
};

// --- ADMIN PANEL ---

const AdminPanel: React.FC<{ currentUser: User; onClose: () => void }> = ({ currentUser, onClose }) => {
    const [tab, setTab] = useState<'OVERVIEW' | 'USERS' | 'REQUESTS' | 'FEEDBACK'>('OVERVIEW');
    const [users, setUsers] = useState<User[]>(getUsers());
    const [requests, setRequests] = useState<AccessRequest[]>(getRequests());
    const [feedbacks, setFeedbacks] = useState<Feedback[]>(getFeedback());
    
    // Refresh data
    const refresh = () => {
        setUsers(getUsers());
        setRequests(getRequests());
        setFeedbacks(getFeedback());
    };

    const handleApprove = (reqId: string) => {
        updateRequestStatus(reqId, 'APPROVED', currentUser.username);
        refresh();
    };

    const handleReject = (reqId: string) => {
        updateRequestStatus(reqId, 'REJECTED', currentUser.username);
        refresh();
    };

    const handleRoleChange = (userId: string, newRole: UserRole) => {
        // Only Owner can assign Trusted Editor or Admin
        if (currentUser.role !== 'OWNER' && (newRole === 'ADMIN' || newRole === 'TRUSTED_EDITOR')) return;
        // Only Owner can change Roles essentially
        if (currentUser.role !== 'OWNER') return; 

        updateUserRole(userId, newRole);
        refresh();
    };

    const handleBanToggle = (user: User) => {
        if (user.role === 'OWNER') return; // Cannot ban owner
        const newStatus = user.status === 'BANNED' ? 'APPROVED' : 'BANNED';
        updateUserStatus(user.id, newStatus);
        refresh();
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    return (
        <div className="min-h-screen bg-black text-cyan-50 font-sans flex flex-col">
            {/* Header */}
            <header className="h-16 border-b border-cyan-900/30 bg-black/50 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-cyan-900/50 flex items-center justify-center text-cyan-400">
                        <ShieldIcon />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">COMMAND CENTER</h1>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">RBAC System v9.0</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-zinc-500">Operative: <span className="text-cyan-400">{currentUser.username}</span></span>
                    <button onClick={onClose} className="px-4 py-1.5 bg-red-900/20 hover:bg-red-900/40 text-red-400 text-xs rounded border border-red-900/30 transition-all">EXIT CONSOLE</button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 border-r border-cyan-900/30 bg-black/30 flex flex-col p-4 gap-2">
                    <button onClick={() => setTab('OVERVIEW')} className={`p-3 rounded-lg text-left text-sm flex items-center gap-3 transition-all ${tab === 'OVERVIEW' ? 'bg-cyan-900/30 text-cyan-300 border border-cyan-500/30' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}>
                        <ChartBarIcon /> SYSTEM OVERVIEW
                    </button>
                    <button onClick={() => setTab('USERS')} className={`p-3 rounded-lg text-left text-sm flex items-center gap-3 transition-all ${tab === 'USERS' ? 'bg-cyan-900/30 text-cyan-300 border border-cyan-500/30' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}>
                        <UserGroupIcon /> OPERATIVES DATABASE
                    </button>
                    <button onClick={() => setTab('REQUESTS')} className={`p-3 rounded-lg text-left text-sm flex items-center gap-3 transition-all ${tab === 'REQUESTS' ? 'bg-cyan-900/30 text-cyan-300 border border-cyan-500/30' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}>
                        <div className="relative"><ShieldIcon /> {requests.filter(r => r.status === 'PENDING').length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}</div>
                         ACCESS REQUESTS
                    </button>
                    <button onClick={() => setTab('FEEDBACK')} className={`p-3 rounded-lg text-left text-sm flex items-center gap-3 transition-all ${tab === 'FEEDBACK' ? 'bg-cyan-900/30 text-cyan-300 border border-cyan-500/30' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}>
                        <FeedbackIcon /> USER FEEDBACK
                    </button>
                </aside>

                {/* Content */}
                <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                    {tab === 'OVERVIEW' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <NeonCard>
                                <h3 className="text-zinc-500 text-xs uppercase tracking-widest">Total Operatives</h3>
                                <p className="text-4xl font-bold text-white mt-2">{users.length}</p>
                            </NeonCard>
                            <NeonCard>
                                <h3 className="text-zinc-500 text-xs uppercase tracking-widest">Pending Requests</h3>
                                <p className="text-4xl font-bold text-yellow-500 mt-2">{requests.filter(r => r.status === 'PENDING').length}</p>
                            </NeonCard>
                            <NeonCard>
                                <h3 className="text-zinc-500 text-xs uppercase tracking-widest">System Status</h3>
                                <p className="text-4xl font-bold text-green-500 mt-2">OPTIMAL</p>
                            </NeonCard>

                            <NeonCard className="col-span-3">
                                <h3 className="text-zinc-500 text-xs uppercase tracking-widest mb-4">Top Active Users</h3>
                                <div className="space-y-2">
                                    {users.sort((a,b) => b.totalTimeSpent - a.totalTimeSpent).slice(0, 5).map(u => (
                                        <div key={u.id} className="flex justify-between items-center p-3 bg-white/5 rounded">
                                            <span className={u.role === 'OWNER' ? 'text-purple-400' : 'text-zinc-300'}>{u.username}</span>
                                            <span className="font-mono text-cyan-400">{formatTime(u.totalTimeSpent)}</span>
                                        </div>
                                    ))}
                                </div>
                            </NeonCard>
                        </div>
                    )}

                    {tab === 'REQUESTS' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold mb-6 text-cyan-400">PENDING AUTHORIZATIONS</h2>
                            {requests.filter(r => r.status === 'PENDING').length === 0 && <p className="text-zinc-600 italic">No pending requests.</p>}
                            {requests.filter(r => r.status === 'PENDING').map(req => (
                                <NeonCard key={req.id} className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-lg">{req.username}</h3>
                                        <p className="text-xs text-zinc-500">Requested: {new Date(req.timestamp).toLocaleString()}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleApprove(req.id)} className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/50 rounded hover:bg-green-500/40 transition-all">APPROVE</button>
                                        <button onClick={() => handleReject(req.id)} className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded hover:bg-red-500/40 transition-all">REJECT</button>
                                    </div>
                                </NeonCard>
                            ))}
                            
                            <h2 className="text-xl font-bold mt-12 mb-6 text-zinc-600">HISTORY</h2>
                            <div className="opacity-50">
                                {requests.filter(r => r.status !== 'PENDING').slice(0, 5).map(req => (
                                    <div key={req.id} className="flex justify-between p-3 border-b border-white/10">
                                        <span>{req.username}</span>
                                        <span className={req.status === 'APPROVED' ? 'text-green-500' : 'text-red-500'}>{req.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {tab === 'USERS' && (
                        <div>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-xs text-zinc-500 uppercase border-b border-zinc-800">
                                        <th className="p-3">User</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Role</th>
                                        <th className="p-3">Total Time</th>
                                        <th className="p-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} className="border-b border-zinc-800/50 hover:bg-white/5 transition-colors">
                                            <td className="p-3 font-medium text-zinc-200">{u.username}</td>
                                            <td className="p-3">
                                                 <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                                                    u.status === 'BANNED' ? 'bg-red-900/30 text-red-400 border-red-500/30' :
                                                    u.status === 'APPROVED' ? 'bg-green-900/30 text-green-400 border-green-500/30' :
                                                    'bg-yellow-900/30 text-yellow-400 border-yellow-500/30'
                                                }`}>
                                                    {u.status}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                                                    u.role === 'OWNER' ? 'bg-purple-900/30 text-purple-400 border-purple-500/30' :
                                                    u.role === 'ADMIN' ? 'bg-cyan-900/30 text-cyan-400 border-cyan-500/30' :
                                                    u.role === 'TRUSTED_EDITOR' ? 'bg-green-900/30 text-green-400 border-green-500/30' :
                                                    'bg-zinc-800 text-zinc-400 border-zinc-600'
                                                }`}>
                                                    {u.role.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="p-3 font-mono text-zinc-400">{formatTime(u.totalTimeSpent)}</td>
                                            <td className="p-3 flex gap-2">
                                                {currentUser.role === 'OWNER' && u.role !== 'OWNER' && (
                                                    <>
                                                        <select 
                                                            value={u.role} 
                                                            onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                                                            className="bg-black border border-zinc-700 text-xs rounded px-2 py-1 outline-none focus:border-cyan-500"
                                                        >
                                                            <option value="USER">User</option>
                                                            <option value="TRUSTED_EDITOR">Trusted Editor</option>
                                                            <option value="ADMIN">Admin</option>
                                                        </select>
                                                        <button 
                                                            onClick={() => handleBanToggle(u)}
                                                            className={`p-1.5 rounded border transition-all ${
                                                                u.status === 'BANNED' 
                                                                ? 'bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/40' 
                                                                : 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/40'
                                                            }`}
                                                            title={u.status === 'BANNED' ? "Unban User" : "Ban User"}
                                                        >
                                                            {u.status === 'BANNED' ? <CheckCircleIcon /> : <BanIcon />}
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {tab === 'FEEDBACK' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold mb-6 text-purple-400">INCOMING TRANSMISSIONS</h2>
                            {feedbacks.length === 0 && <p className="text-zinc-600 italic">No feedback signals received.</p>}
                            <div className="grid grid-cols-1 gap-4">
                                {feedbacks.slice().reverse().map(fb => (
                                    <NeonCard key={fb.id} className="border-purple-500/20 hover:border-purple-500/40">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-white">{fb.username}</h3>
                                            <span className="text-xs text-zinc-500">{new Date(fb.timestamp).toLocaleString()}</span>
                                        </div>
                                        <p className="text-zinc-300 text-sm whitespace-pre-wrap">{fb.text}</p>
                                    </NeonCard>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

// --- MAIN APP (WRAPPED) ---

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'AUTH' | 'APP' | 'ADMIN' | 'PENDING'>('AUTH');
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<SendingStatus>(SendingStatus.Idle);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
      if (currentUser) logUsage(currentUser.id, currentUser.username, 'LOGOUT');
      setCurrentUser(null);
      setView('AUTH');
  };

  // Time Tracking & Security Check
  useEffect(() => {
    let interval: any;
    if (currentUser && (view === 'APP' || view === 'ADMIN')) {
        interval = setInterval(() => {
            // Check if user is still allowed (security check)
            const currentStoredUser = getUsers().find(u => u.id === currentUser.id);
            if (currentStoredUser && (currentStoredUser.status === 'BANNED' || currentStoredUser.status === 'REJECTED')) {
                // Force Logout
                alert("Session Terminated: Access Revoked by Administrator.");
                handleLogout();
                return;
            }
            // Update time
            updateTotalTime(currentUser.id, 60); 
        }, 60000);
    }
    return () => clearInterval(interval);
  }, [currentUser, view]);

  // Initial Load (Session persistence)
  useEffect(() => {
      // In a real app we'd check session token. Here we rely on AuthScreen to re-auth or simple state
      // For this demo, we start at AUTH.
  }, []);

  const handleLogin = (user: User) => {
      setCurrentUser(user);
      if (user.status === 'PENDING') {
          setView('PENDING');
      } else {
          setView('APP');
      }
  };

  // Chat Logic (Existing)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setStatus(SendingStatus.Sending);
    try {
      const responseText = await sendMessageToGemini(userMessage.text);
      const botMessage: Message = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: new Date() };
      setMessages((prev) => [...prev, botMessage]);
      setStatus(SendingStatus.Idle);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = { id: (Date.now() + 1).toString(), role: 'model', text: "Error processing ad.", timestamp: new Date() };
      setMessages((prev) => [...prev, errorMessage]);
      setStatus(SendingStatus.Error);
    }
  };

  const handleRegenerate = async (messageId: string, promptText: string) => {
    if (status === SendingStatus.Sending) return;
    setStatus(SendingStatus.Sending);
    try {
      const responseText = await sendMessageToGemini(promptText);
      setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, text: responseText, timestamp: new Date() } : msg));
      setStatus(SendingStatus.Idle);
    } catch (error) {
        console.error("Regeneration failed", error);
        setStatus(SendingStatus.Error);
    }
  };
  
  const handleMessageChange = (id: string, newText: string) => {
    // Only Trusted Editors, Admins, and Owner can Edit
    if (currentUser?.role === 'USER') return; // Read only for basic users? Or allowing them to edit local only
    setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, text: newText } : msg));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- RENDER LOGIC ---

  if (view === 'AUTH' || !currentUser) {
      return <AuthScreen onLogin={handleLogin} />;
  }

  if (view === 'PENDING') {
      return <PendingScreen />;
  }

  if (view === 'ADMIN') {
      return <AdminPanel currentUser={currentUser} onClose={() => setView('APP')} />;
  }

  // --- MAIN APP VIEW ---
  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-zinc-100 font-sans overflow-hidden">
      {/* Feedback Modal */}
      {currentUser && (
        <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} currentUser={currentUser} />
      )}

      {/* Header */}
      <header className="flex-none bg-zinc-900 border-b border-red-900/30 p-4 shadow-lg z-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center font-bold text-xl shadow-red-900/50 shadow-lg text-white">
                LI
             </div>
             <div>
                 <h1 className="text-xl font-bold tracking-tight text-white">LIFEINVADER <span className="text-red-600">AI</span></h1>
                 <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Internal Ad Systems</p>
             </div>
        </div>
        <div className="flex items-center gap-3">
             {/* Admin Button */}
             {(currentUser.role === 'OWNER' || currentUser.role === 'ADMIN') && (
                 <button onClick={() => setView('ADMIN')} className="text-xs bg-cyan-900/30 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded hover:bg-cyan-900/50 transition-all flex items-center gap-2">
                     <ShieldIcon /> ADMIN PANEL
                 </button>
             )}
             
             {/* Feedback Button */}
             <button onClick={() => setShowFeedback(true)} className="text-xs bg-zinc-800 text-zinc-300 border border-zinc-600 px-3 py-1.5 rounded hover:bg-zinc-700 transition-all flex items-center gap-2" title="Send Feedback">
                <FeedbackIcon />
             </button>
             
             <div className="text-right mr-2 hidden sm:block">
                 <div className="text-xs font-bold text-white">{currentUser.username}</div>
                 <div className="text-[10px] text-zinc-500 uppercase">{currentUser.role.replace('_', ' ')}</div>
             </div>
             <button onClick={handleLogout} className="text-xs text-red-500 hover:text-red-400 underline">Logout</button>
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
              const canEdit = currentUser.role !== 'USER'; // Normal users cannot edit output in this strict mode
              
              return (
                <div key={msg.id} className={`flex w-full group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`relative p-5 sm:p-6 rounded-2xl shadow-xl text-base md:text-lg leading-relaxed transition-all duration-200 ${
                    msg.role === 'user'
                        ? 'max-w-[85%] md:max-w-[75%] bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-br-none hover:border-zinc-600 whitespace-pre-wrap'
                        : 'w-full max-w-[98%] md:max-w-[95%] bg-gradient-to-br from-red-600/10 to-zinc-900 border border-red-900/30 text-zinc-200 rounded-bl-none hover:border-red-900/50 hover:shadow-red-900/10'
                    }`}>
                    {msg.role === 'model' && (
                        <>
                            <div className="absolute -top-3 left-0 bg-zinc-900 text-[10px] text-red-500 px-2 py-0.5 border border-red-900/30 rounded-full uppercase tracking-wider font-bold shadow-sm">
                                {canEdit ? 'AI Edited (Editable)' : 'AI Output (Locked)'}
                            </div>
                            <div className="absolute top-3 right-3 flex gap-2 z-10">
                                {promptText && canEdit && (
                                    <button onClick={() => handleRegenerate(msg.id, promptText)} disabled={status === SendingStatus.Sending} className={`p-2 rounded-lg transition-all ${status === SendingStatus.Sending ? 'animate-spin' : 'hover:bg-black/40 text-zinc-400 hover:text-white'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.919z" clipRule="evenodd" /></svg>
                                    </button>
                                )}
                                <CopyButton text={msg.text} />
                            </div>
                        </>
                    )}
                    <div className={msg.role === 'model' ? 'pr-20 pt-1' : ''}>
                        {msg.role === 'model' && canEdit ? (
                            <EditableResponse text={msg.text} onChange={(newText) => handleMessageChange(msg.id, newText)} />
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
                    disabled={status === SendingStatus.Sending}
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
                    <SparkleIcon />
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