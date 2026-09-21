import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, MessageSquare, Compass, ShieldCheck } from 'lucide-react';
import { HOTEL_CONFIG } from '../data/hotelData';
import { playReceptionChime } from '../utils/soundAlert';

export default function AiConciergeModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Namaskar! Welcome to Hotel Sai International, Rayagada. I am your 24/7 Chief Concierge grounded with real-time hotel facts, RGDA train transit details, and sacred Maa Majhighariani Temple timings. How may I assist your stay?`
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    "What time is Darshan at Maa Majhighariani Temple?",
    "How far is Rayagada Railway Station?",
    "What are the 40-room inventory tariffs?",
    "Do you serve Jain & Satvik food without onion/garlic?",
    "How can JK Paper / IMFA book corporate accounts?"
  ];

  const handleSend = async (queryText) => {
    const text = (queryText || inputQuery).trim();
    if (!text || loading) return;

    // Security check: 400-char limit
    const cleanText = text.substring(0, 400);

    setMessages(prev => [...prev, { sender: 'user', text: cleanText }]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: cleanText })
      });
      const data = await res.json();
      playReceptionChime();
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: data.reply || "Thank you for inquiring! Please feel free to reach our 24/7 reception desk at +91 6856 225555." 
      }]);
    } catch (err) {
      playReceptionChime();
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: "Namaskar! Hotel Sai International is located in Sai Priya Nagar, Rayagada (1.5 km to RGDA Station, 2.0 km to Maa Majhighariani Temple). We feature 40 rooms from ₹1,699 to ₹3,999 with complimentary breakfast. For immediate assistance, dial +91 6856 225555."
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: 640, height: '80vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #38bdf8 0%, #1d4ed8 100%)',
              padding: '0.45rem',
              borderRadius: '8px',
              color: '#fff'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>24/7 Grounded AI Concierge</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Hotel Sai International • Rayagada Facts, Temple Sights & Room Guidance
              </div>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Quick Prompts Bar */}
        <div style={{
          padding: '0.75rem 1.25rem',
          background: 'rgba(6, 14, 26, 0.6)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          gap: '0.4rem',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                background: 'rgba(12, 24, 43, 0.8)',
                color: 'var(--sapphire-light)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                whiteSpace: 'nowrap'
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div style={{
          flex: 1,
          padding: '1.25rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                maxWidth: '82%',
                padding: '0.85rem 1.15rem',
                borderRadius: '12px',
                fontSize: '0.88rem',
                lineHeight: 1.5,
                background: m.sender === 'user' 
                  ? 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)' 
                  : 'rgba(12, 24, 43, 0.85)',
                color: '#fff',
                border: m.sender === 'user' 
                  ? '1px solid #3b82f6' 
                  : '1px solid rgba(212, 175, 55, 0.25)',
                whiteSpace: 'pre-line'
              }}>
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                background: 'rgba(12, 24, 43, 0.85)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                fontSize: '0.82rem',
                color: 'var(--gold-glow)'
              }}>
                Consulting Hotel Sai International knowledge base...
              </div>
            </div>
          )}
        </div>

        {/* Input Box with 400-char cap */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid rgba(212, 175, 55, 0.2)',
          background: 'rgba(6, 14, 26, 0.9)'
        }}>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}
          >
            <input 
              type="text"
              className="form-input"
              style={{ flex: 1 }}
              placeholder="Ask about 40-room tariffs, temple timings, or Rayagada trains..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value.slice(0, 400))}
              maxLength={400}
            />
            <button 
              type="submit" 
              disabled={loading || !inputQuery.trim()}
              className="btn-primary-gold" 
              style={{ padding: '0.75rem 1rem', opacity: (loading || !inputQuery.trim()) ? 0.6 : 1 }}
            >
              <Send size={16} />
            </button>
          </form>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem', textAlign: 'right' }}>
            {inputQuery.length} / 400 character safety cap
          </div>
        </div>
      </div>
    </div>
  );
}
