import { useState } from "react";
import { askAssistant } from "../services/api.js";

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! Ask me for a mini study plan." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages([...messages, userMsg]);
    setLoading(true);

    const result = await askAssistant(input);

    if (result && result.reply) {
      const aiMsg = { role: "ai", text: result.reply };
      setMessages(prev => [...prev, aiMsg]);
    } else {
      setMessages(prev => [
        ...prev,
        { role: "ai", text: "Sorry, I couldn't generate an answer." },
      ]);
    }

    setInput("");
    setLoading(false);
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">AI Assistant</h2>

      {/* Messages box */}
      <div className="border rounded-lg p-4 h-80 overflow-y-auto bg-white dark:bg-zinc-900">
        {messages.map((m, i) => (
          <div key={i} className="mb-3">
            <strong>{m.role === "ai" ? "AI:" : "You:"}</strong>
            <p className="text-sm whitespace-pre-line">{m.text}</p>
          </div>
        ))}
      </div>

      {/* Input box */}
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-md px-3 py-2"
          placeholder="Ask the AI..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          className="px-4 py-2 rounded-md bg-zinc-900 text-white"
          onClick={handleSend}
          disabled={loading}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
