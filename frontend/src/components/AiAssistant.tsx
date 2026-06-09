import { useMemo, useState } from 'react';
import { Bot, Send, X } from 'lucide-react';

type ChatMessage = {
  role: 'assistant' | 'user';
  text: string;
};

const PROJECT_ANSWERS = [
  {
    keys: ['delivery', 'track', 'gps', 'eta', 'driver'],
    answer: 'Kitayi supports live GPS delivery tracking. Once an order is dispatched, customers receive a tracking link and ETA updates.',
  },
  {
    keys: ['payment', 'pay', 'mpesa', 'm-pesa', 'stripe', 'paypal', 'bill'],
    answer: 'Payments can be made through M-Pesa STK Push, card payments, PayPal, or the Pay Bill page for bill settlement without logging in.',
  },
  {
    keys: ['order', 'shop', 'product', 'bottle', 'tanker', 'refill'],
    answer: 'Customers can order bottled water, 20L dispenser refills, and bulk tanker deliveries from the shop or quick order section.',
  },
  {
    keys: ['subscription', 'recurring', 'weekly', 'monthly'],
    answer: 'Kitayi supports recurring delivery subscriptions with weekly, bi-weekly, and monthly options for homes and businesses.',
  },
  {
    keys: ['certified', 'quality', 'kebs', 'who', 'purified', 'purification'],
    answer: 'Kitayi presents its water as KEBS and WHO certified, with purified bottled water and quality-focused delivery services.',
  },
  {
    keys: ['contact', 'support', 'phone', 'email', 'helpline', 'emergency'],
    answer: 'For support, contact Kitayi at +254 705 002 891 (emergency helpline) or email info@kitayi.co.ke. Our head office is at P.O Box 132-50204, Kimilli, Bungoma.',
  },
  {
    keys: ['account', 'login', 'register', 'dashboard', 'corporate'],
    answer: 'Customers can create residential or commercial accounts, then use the dashboard for orders, subscriptions, billing, and delivery activity.',
  },
];

function getProjectAnswer(question: string) {
  const normalized = question.toLowerCase();
  const match = PROJECT_ANSWERS.find(item => item.keys.some(key => normalized.includes(key)));

  if (!match) {
    return 'I can only answer questions about the Kitayi Solutions water delivery project, including orders, payments, delivery tracking, accounts, subscriptions, contact, and water quality.';
  }

  return match.answer;
}

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Ask me about Kitayi orders, payments, delivery tracking, subscriptions, accounts, or support.',
    },
  ]);

  const quickQuestions = useMemo(() => [
    'How do I track my delivery?',
    'What payments are supported?',
    'How do subscriptions work?',
  ], []);

  const ask = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    setMessages(current => [
      ...current,
      { role: 'user', text: trimmed },
      { role: 'assistant', text: getProjectAnswer(trimmed) },
    ]);
    setInput('');
  };

  return (
    <div className="fixed bottom-5 left-5 z-[60] md:left-auto md:right-5">
      {open && (
        <div className="mb-4 w-[calc(100vw-2.5rem)] max-w-sm overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl">
          <div className="brand-surface flex items-center justify-between px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="text-sm font-bold">Kitayi Assistant</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-white/15" aria-label="Close assistant">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-80 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  message.role === 'assistant'
                    ? 'bg-white text-slate-700 shadow-sm'
                    : 'ml-8 bg-blue-600 text-white'
                }`}
              >
                {message.text}
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map(question => (
                <button
                  key={question}
                  type="button"
                  onClick={() => ask(question)}
                  className="rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 hover:border-blue-300"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={event => {
              event.preventDefault();
              ask(input);
            }}
            className="flex gap-2 border-t border-slate-200 bg-white p-3"
          >
            <input
              value={input}
              onChange={event => setInput(event.target.value)}
              placeholder="Ask about this project..."
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400"
            />
            <button type="submit" className="btn-cta px-3 py-2" aria-label="Send message">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(current => !current)}
        className="brand-surface flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_18px_42px_rgba(14,165,233,0.45)] transition-transform hover:-translate-y-0.5"
        aria-label="Open Kitayi assistant"
      >
        <Bot className="h-6 w-6" />
      </button>
    </div>
  );
}
