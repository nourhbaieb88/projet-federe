import { useState, useEffect } from "react";
import { messageService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { FaComments, FaPaperPlane, FaClock } from "react-icons/fa";

function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // Charger les conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const data = await messageService.getConversations();
        setConversations(data.results || data);
        setError("");
        
        // Sélectionner la première conversation par défaut
        if (data.results?.length > 0) {
          setSelectedConversation(data.results[0]);
        } else if (data.length > 0) {
          setSelectedConversation(data[0]);
        }
      } catch (err) {
        setError("Erreur lors du chargement des conversations");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadConversations();
    }
  }, [user]);

  // Charger les messages de la conversation sélectionnée
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConversation) return;

      try {
        const data = await messageService.getMessages(selectedConversation.id);
        setMessages(data.results || data || []);
      } catch (err) {
        console.error("Error loading messages:", err);
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 3000); // Rafraîchir chaque 3 secondes

    return () => clearInterval(interval);
  }, [selectedConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim()) return;

    setSendingMessage(true);
    setError("");

    try {
      await messageService.sendMessage(selectedConversation.id, messageText);
      setMessageText("");
      
      // Recharger les messages
      const data = await messageService.getMessages(selectedConversation.id);
      setMessages(data.results || data || []);
    } catch (err) {
      setError("Erreur lors de l'envoi du message");
      console.error("Error:", err);
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "2rem" }}>
        <p>Chargement de vos messages...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="container">
        <div className="glass-panel" style={{ textAlign: "center", padding: "3rem" }}>
          <FaComments size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
          <h2>Aucune conversation</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Vous n'avez pas encore de conversations. Contactez un établissement depuis ses détails !
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="section-header" style={{ marginBottom: "2rem" }}>
        <h1 className="section-title">Mes Messages</h1>
        <p className="section-subtitle">Communiquez avec les établissements</p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        gap: "1rem",
        height: "600px",
        minHeight: "600px"
      }}>
        {/* Liste des conversations */}
        <div className="glass-panel" style={{
          overflow: "hidden",
          display: "flex",
          flexDirection: "column"
        }}>
          <h3 style={{ marginBottom: "1rem", paddingRight: "1rem" }}>Conversations</h3>
          <div style={{
            overflow: "auto",
            flex: 1
          }}>
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => {
                  setSelectedConversation(conversation);
                  setMessageText("");
                }}
                style={{
                  width: "100%",
                  padding: "1rem",
                  border: "none",
                  background: selectedConversation?.id === conversation.id
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "rgba(255, 255, 255, 0.05)",
                  color: "white",
                  textAlign: "left",
                  cursor: "pointer",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  transition: "background 0.3s ease"
                }}
              >
                <strong style={{ display: "block", marginBottom: "0.25rem" }}>
                  {conversation.participant?.first_name} {conversation.participant?.last_name}
                </strong>
                <span style={{
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  display: "block",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {conversation.last_message || "Nouvelle conversation"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Zone de chat */}
        <div className="glass-panel" style={{
          display: "flex",
          flexDirection: "column"
        }}>
          {selectedConversation && (
            <>
              {/* En-tête */}
              <div style={{
                paddingBottom: "1rem",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                marginBottom: "1rem"
              }}>
                <h3 style={{ margin: 0, marginBottom: "0.25rem" }}>
                  {selectedConversation.participant?.first_name} {selectedConversation.participant?.last_name}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  <FaClock size={12} />
                  {selectedConversation.participant?.establishment ? "Établissement" : "Client"}
                </p>
              </div>

              {error && (
                <div style={{
                  backgroundColor: "#ff6b6b",
                  color: "white",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  fontSize: "0.9rem"
                }}>
                  {error}
                </div>
              )}

              {/* Messages */}
              <div style={{
                flex: 1,
                overflow: "auto",
                marginBottom: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem"
              }}>
                {messages.length === 0 ? (
                  <p style={{
                    textAlign: "center",
                    color: "var(--text-muted)",
                    margin: "auto"
                  }}>
                    Aucun message pour le moment
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        display: "flex",
                        justifyContent: msg.sender?.id === user?.id ? "flex-end" : "flex-start"
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "70%",
                          padding: "0.75rem 1rem",
                          borderRadius: "12px",
                          backgroundColor: msg.sender?.id === user?.id
                            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                            : "rgba(255, 255, 255, 0.1)",
                          wordWrap: "break-word"
                        }}
                      >
                        <p style={{ margin: 0 }}>{msg.text || msg.content}</p>
                        <span style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                          display: "block",
                          marginTop: "0.25rem"
                        }}>
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Formulaire d'envoi */}
              <form onSubmit={handleSendMessage} style={{
                display: "flex",
                gap: "0.5rem"
              }}>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Écrivez votre message..."
                  disabled={sendingMessage}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    color: "white",
                    fontFamily: "inherit"
                  }}
                />
                <button
                  type="submit"
                  disabled={sendingMessage || !messageText.trim()}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: sendingMessage ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    opacity: sendingMessage || !messageText.trim() ? 0.7 : 1
                  }}
                >
                  <FaPaperPlane size={14} />
                  Envoyer
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;
