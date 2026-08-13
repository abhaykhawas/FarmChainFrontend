import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { ArrowLeft, MessageSquareText, Send, Sprout } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import api, { apiError, SERVER_URL } from "../../api/client";
import { EmptyState, ErrorState, Loader, PageHeader } from "../../components/UI";
import { useAuth } from "../../context/AuthContext";
import { dateTime, initials, shortId } from "../../utils/format";

export default function ChatPage() {
  const { user } = useAuth(); const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]); const [selectedId, setSelectedId] = useState(searchParams.get("conversation") || ""); const [messages, setMessages] = useState([]); const [text, setText] = useState(""); const [loading, setLoading] = useState(true); const [messageLoading, setMessageLoading] = useState(false); const [error, setError] = useState(""); const [sending, setSending] = useState(false); const socketRef = useRef(null); const bottomRef = useRef(null);

  useEffect(() => {
    const load = async () => { setLoading(true); setError(""); try { const list = (await api.get("/chat")).data; setConversations(list); const requested = searchParams.get("conversation"); setSelectedId((current) => requested || current || list[0]?._id || ""); } catch (err) { setError(apiError(err)); } finally { setLoading(false); } };
    load();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("farmchain_token");
    const socket = io(SERVER_URL, { auth: { token } });
    socketRef.current = socket;
    socket.on("message:new", (message) => setMessages((current) => current.some((item) => item._id === message._id) ? current : [...current, message]));
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setSearchParams({ conversation: selectedId }, { replace: true });
    setMessageLoading(true);
    socketRef.current?.emit("conversation:join", selectedId);
    api.get(`/chat/${selectedId}/messages`).then(({ data }) => setMessages(data)).catch((err) => setError(apiError(err))).finally(() => setMessageLoading(false));
    return () => socketRef.current?.emit("conversation:leave", selectedId);
  }, [selectedId]);

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);
  const selected = conversations.find((item) => item._id === selectedId);
  const other = useMemo(() => selected?.participants.find((person) => person._id !== user._id), [selected, user._id]);
  const send = async (event) => { event.preventDefault(); const body = text.trim(); if (!body || sending) return; setText(""); setSending(true); try { const { data } = await api.post(`/chat/${selectedId}/messages`, { text: body }); setMessages((current) => current.some((item) => item._id === data._id) ? current : [...current, data]); setConversations((current) => current.map((item) => item._id === selectedId ? { ...item, lastMessage: body, lastMessageAt: data.createdAt } : item)); } catch (err) { setText(body); setError(apiError(err)); } finally { setSending(false); } };
  if (loading) return <Loader label="Opening conversations…" />;
  if (error && !conversations.length) return <ErrorState message={error} />;

  return <div className="chat-page"><PageHeader eyebrow="Direct connections" title="Messages" description="Keep order conversations clear and close to the people involved." /><div className={`chat-shell ${selectedId ? "has-selection" : ""}`}><aside className="conversation-list"><div className="conversation-heading"><h2>Conversations</h2><span>{conversations.length}</span></div>{conversations.length ? conversations.map((conversation) => { const person = conversation.participants.find((item) => item._id !== user._id); return <button type="button" key={conversation._id} className={selectedId === conversation._id ? "active" : ""} onClick={() => setSelectedId(conversation._id)}><span className="avatar">{initials(person?.name)}</span><span><strong>{person?.businessName || person?.name}</strong><small>{conversation.lastMessage || (conversation.order ? `Order ${shortId(conversation.order?._id || conversation.order)}` : "Start the conversation")}</small></span>{conversation.lastMessageAt && <time>{new Date(conversation.lastMessageAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</time>}</button>; }) : <EmptyState icon={MessageSquareText} title="No conversations" description="Start a chat from an order or supplier profile." />}</aside><section className="message-panel">{selected ? <><header className="message-header"><button className="chat-back" type="button" onClick={() => setSelectedId("")}><ArrowLeft /></button><span className="avatar">{initials(other?.name)}</span><div><strong>{other?.businessName || other?.name}</strong><small>{other?.role === "supplier" ? "FarmChain supplier" : "FarmChain buyer"}{selected.order && ` · ${shortId(selected.order?._id || selected.order)}`}</small></div></header><div className="messages">{messageLoading ? <Loader label="Loading messages…" /> : messages.length ? messages.map((message) => { const mine = message.sender?._id === user._id || message.sender === user._id; return <div className={mine ? "message message--mine" : "message"} key={message._id}><div>{message.text}</div><small>{dateTime(message.createdAt)}</small></div>; }) : <div className="message-empty"><span><Sprout /></span><h3>Start a conversation</h3><p>Ask about produce, delivery, order details, or anything else you need.</p></div>}<div ref={bottomRef} /></div><form className="message-composer" onSubmit={send}><input value={text} onChange={(e) => setText(e.target.value)} aria-label="Message" placeholder={`Message ${other?.name?.split(" ")[0] || "partner"}…`} /><button type="submit" disabled={!text.trim() || sending} aria-label="Send message"><Send size={19} /></button></form></> : <div className="select-conversation"><span><MessageSquareText /></span><h2>Select a conversation</h2><p>Choose a partner on the left to view your messages.</p></div>}</section></div></div>;
}
