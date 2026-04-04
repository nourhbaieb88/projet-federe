import { useState } from "react";
import Button from "../components/Button";

function Messages() {
  const [conversations, setConversations] = useState([
    {
      id: 1,
      establishment: "Restaurant Le Jardin",
      lastMessage: "Merci pour votre réservation ! Nous vous attendons le 15 avril à 19h.",
      timestamp: "2026-04-10 14:30",
      unread: true,
      messages: [
        {
          id: 1,
          sender: "Restaurant Le Jardin",
          message: "Bonjour ! Nous avons bien reçu votre demande de réservation pour le 15 avril à 19h.",
          timestamp: "2026-04-08 10:15",
          isFromEstablishment: true
        },
        {
          id: 2,
          sender: "Vous",
          message: "Parfait ! Dois-je apporter quelque chose de spécial ?",
          timestamp: "2026-04-08 10:30",
          isFromEstablishment: false
        },
        {
          id: 3,
          sender: "Restaurant Le Jardin",
          message: "Non, tout est prévu ! Nous avons hâte de vous accueillir.",
          timestamp: "2026-04-08 10:45",
          isFromEstablishment: true
        },
        {
          id: 4,
          sender: "Restaurant Le Jardin",
          message: "Merci pour votre réservation ! Nous vous attendons le 15 avril à 19h.",
          timestamp: "2026-04-10 14:30",
          isFromEstablishment: true
        }
      ]
    },
    {
      id: 2,
      establishment: "Café Central",
      lastMessage: "Votre commande est prête !",
      timestamp: "2026-04-09 16:20",
      unread: false,
      messages: [
        {
          id: 1,
          sender: "Café Central",
          message: "Bonjour ! Votre commande de café et croissant est prête.",
          timestamp: "2026-04-09 16:20",
          isFromEstablishment: true
        }
      ]
    }
  ]);

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message = {
      id: selectedConversation.messages.length + 1,
      sender: "Vous",
      message: newMessage,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isFromEstablishment: false
    };

    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, message],
          lastMessage: newMessage,
          timestamp: message.timestamp,
          unread: false
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setSelectedConversation({
      ...selectedConversation,
      messages: [...selectedConversation.messages, message],
      lastMessage: newMessage,
      timestamp: message.timestamp,
      unread: false
    });
    setNewMessage("");
  };

  const markAsRead = (conversationId) => {
    const updatedConversations = conversations.map(conv =>
      conv.id === conversationId ? { ...conv, unread: false } : conv
    );
    setConversations(updatedConversations);
  };

  return (
    <div className="container">
      <div className="glass-panel">
        <h2 className="page-title" style={{marginBottom: "2rem"}}>💬 Mes Messages</h2>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', height: '600px'}}>
          {/* Liste des conversations */}
          <div className="glass-panel" style={{padding: '1rem'}}>
            <h3 style={{marginBottom: '1rem'}}>Conversations</h3>
            <div style={{display: 'grid', gap: '0.5rem', maxHeight: '500px', overflowY: 'auto'}}>
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv);
                    markAsRead(conv.id);
                  }}
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    background: selectedConversation?.id === conv.id ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    border: conv.unread ? '2px solid var(--accent-color)' : '1px solid var(--border-color)'
                  }}
                >
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
                    <h4 style={{margin: 0, fontSize: '1rem'}}>{conv.establishment}</h4>
                    {conv.unread && (
                      <span style={{
                        background: 'var(--accent-color)',
                        color: 'white',
                        borderRadius: '50%',
                        width: '8px',
                        height: '8px',
                        display: 'inline-block'
                      }}></span>
                    )}
                  </div>
                  <p style={{
                    margin: '0.25rem 0',
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {conv.lastMessage}
                  </p>
                  <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>
                    {conv.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Zone de messages */}
          <div className="glass-panel" style={{padding: '1rem', display: 'flex', flexDirection: 'column'}}>
            {selectedConversation ? (
              <>
                <h3 style={{marginBottom: '1rem'}}>{selectedConversation.establishment}</h3>

                {/* Messages */}
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  marginBottom: '1rem',
                  padding: '1rem',
                  background: 'rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                  maxHeight: '400px'
                }}>
                  {selectedConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        marginBottom: '1rem',
                        display: 'flex',
                        justifyContent: msg.isFromEstablishment ? 'flex-start' : 'flex-end'
                      }}
                    >
                      <div style={{
                        maxWidth: '70%',
                        padding: '0.75rem',
                        borderRadius: '12px',
                        background: msg.isFromEstablishment ? 'rgba(59, 130, 246, 0.2)' : 'var(--accent-color)',
                        color: 'var(--text-color)',
                        border: msg.isFromEstablishment ? '1px solid rgba(59, 130, 246, 0.3)' : 'none'
                      }}>
                        <p style={{margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 'bold'}}>
                          {msg.sender}
                        </p>
                        <p style={{margin: 0, lineHeight: '1.4'}}>
                          {msg.message}
                        </p>
                        <span style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block'}}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Zone de saisie */}
                <div style={{display: 'flex', gap: '1rem'}}>
                  <input
                    type="text"
                    placeholder="Tapez votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--panel-bg)',
                      color: 'var(--text-color)',
                      fontSize: '1rem'
                    }}
                  />
                  <Button
                    text="Envoyer"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  />
                </div>
              </>
            ) : (
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)'
              }}>
                <div style={{textAlign: 'center'}}>
                  <div style={{fontSize: '3rem', marginBottom: '1rem'}}>💬</div>
                  <p>Sélectionnez une conversation pour voir les messages</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;