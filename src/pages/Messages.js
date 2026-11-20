import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import Button from "../components/Button";
import { messageService } from "../services/api";

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const messagesEndRef = useRef(null);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (error) {
      return null;
    }
  }, []);

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchConversations = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      const data = await messageService.getAll();
      const nextConversations = Array.isArray(data) ? data : data.results || [];
      setConversations(nextConversations);
      if (nextConversations.length > 0) {
        const hasSelectedConversation = nextConversations.some(
          (conversation) => conversation.id === selectedConversationId
        );
        if (!selectedConversationId || !hasSelectedConversation) {
          setSelectedConversationId(nextConversations[0].id);
        }
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Erreur de recuperation des conversations:", error);
      toast.error("Impossible de charger les conversations.");
    } finally {
      if (showLoader) {
        setLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  }, [selectedConversationId]);

  const fetchMessages = useCallback(async (conversationId) => {
    try {
      const data = await messageService.getMessages(conversationId);
      const nextMessages = Array.isArray(data) ? data : data.results || [];
      setMessages(nextMessages);

      await messageService.markAsRead(conversationId).catch(() => null);
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, unread_count: 0 }
            : conversation
        )
      );
    } catch (error) {
      console.error("Erreur de recuperation des messages:", error);
      toast.error("Impossible de charger cette conversation.");
    }
  }, []);

  const refreshInbox = useCallback(
    async (showLoader = false) => {
      await fetchConversations(showLoader);
      if (selectedConversationId) {
        await fetchMessages(selectedConversationId);
      }
    },
    [fetchConversations, fetchMessages, selectedConversationId]
  );

  useEffect(() => {
    refreshInbox(true);
    const intervalId = setInterval(() => {
      refreshInbox(false);
    }, 20000);

    return () => {
      clearInterval(intervalId);
    };
  }, [refreshInbox]);

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
    }
  }, [fetchMessages, selectedConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId) {
      return;
    }

    try {
      setSending(true);
      const sentMessage = await messageService.sendMessage(
        selectedConversationId,
        newMessage.trim()
      );

      setMessages((current) => [...current, sentMessage]);
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === selectedConversationId
            ? {
                ...conversation,
                last_message: sentMessage,
                unread_count: 0,
              }
            : conversation
        )
      );
      setNewMessage("");
    } catch (error) {
      console.error("Erreur d'envoi:", error);
      toast.error(error.message || "Impossible d'envoyer le message.");
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (dateString) => {
    if (!dateString) {
      return "";
    }

    try {
      return new Date(dateString).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  const lastUpdatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--:--";

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "5rem" }}>
        <div className="spinner"></div> Chargement de la messagerie...
      </div>
    );
  }

  return (
    <div className="container">
      <div className="section-header">
        <h1 className="section-title">Messages</h1>
        <p className="section-subtitle">Discutez avec vos contacts en temps reel.</p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ color: "var(--text-muted)" }}>
          Derniere mise a jour : {lastUpdatedLabel}
        </div>
        <Button
          text={isRefreshing ? "Actualisation..." : "Actualiser"}
          className="btn-secondary"
          onClick={() => refreshInbox(false)}
          disabled={isRefreshing}
        />
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(260px, 320px) 1fr",
            minHeight: "70vh",
          }}
        >
          <div
            style={{
              borderRight: "1px solid var(--border-color)",
              background: "rgba(15, 23, 42, 0.35)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)" }}>
              <h3 style={{ margin: 0 }}>Boite de reception</h3>
              <p style={{ margin: "0.35rem 0 0", color: "var(--text-muted)" }}>
                {conversations.reduce(
                  (count, conversation) => count + (conversation.unread_count || 0),
                  0
                )}{" "}
                message(s) non lu(s)
              </p>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
              {conversations.length === 0 ? (
                <p style={{ color: "var(--text-muted)" }}>Aucune conversation pour le moment.</p>
              ) : (
                conversations.map((conversation) => {
                  const title =
                    currentUser?.user_type === "establishment"
                      ? conversation.client_name || conversation.client_username || "Client"
                      : conversation.establishment_name || "Etablissement";

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => setSelectedConversationId(conversation.id)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "1rem",
                        borderRadius: "12px",
                        border:
                          selectedConversationId === conversation.id
                            ? "1px solid var(--accent-color)"
                            : "1px solid transparent",
                        background:
                          selectedConversationId === conversation.id
                            ? "rgba(59, 130, 246, 0.12)"
                            : "transparent",
                        color: "inherit",
                        cursor: "pointer",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "0.75rem",
                          marginBottom: "0.35rem",
                        }}
                      >
                        <strong>{title}</strong>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                          {conversation.last_message
                            ? formatTimestamp(conversation.last_message.created_at)
                            : ""}
                        </span>
                      </div>
                      <div
                        style={{
                          color:
                            conversation.unread_count > 0
                              ? "var(--text-color)"
                              : "var(--text-muted)",
                          fontSize: "0.92rem",
                        }}
                      >
                        {conversation.last_message?.content?.slice(0, 90) || "Nouvelle conversation"}
                        {conversation.last_message?.content?.length > 90 ? "..." : ""}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {selectedConversation ? (
              <>
                <div
                  style={{
                    padding: "1.5rem",
                    borderBottom: "1px solid var(--border-color)",
                    background: "rgba(15, 23, 42, 0.2)",
                  }}
                >
                  <h3 style={{ margin: 0 }}>
                    {currentUser?.user_type === "establishment"
                      ? selectedConversation.client_name || selectedConversation.client_username
                      : selectedConversation.establishment_name}
                  </h3>
                </div>

                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {messages.length === 0 ? (
                    <p style={{ color: "var(--text-muted)" }}>
                      Aucun message pour le moment. Lancez la conversation.
                    </p>
                  ) : (
                    messages.map((message) => {
                      const isMe = message.is_from_me;
                      return (
                        <div
                          key={message.id}
                          style={{
                            alignSelf: isMe ? "flex-end" : "flex-start",
                            maxWidth: "75%",
                          }}
                        >
                          <div
                            style={{
                              padding: "1rem",
                              borderRadius: "16px",
                              background: isMe
                                ? "var(--accent-color)"
                                : "rgba(255,255,255,0.06)",
                              border: isMe ? "none" : "1px solid var(--border-color)",
                              color: "white",
                            }}
                          >
                            {message.content}
                          </div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-muted)",
                              marginTop: "0.35rem",
                              textAlign: isMe ? "right" : "left",
                            }}
                          >
                            {formatTimestamp(message.created_at)}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div
                  style={{
                    padding: "1.5rem",
                    borderTop: "1px solid var(--border-color)",
                    background: "rgba(15, 23, 42, 0.35)",
                    display: "flex",
                    gap: "1rem",
                  }}
                >
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ecrivez un message..."
                    value={newMessage}
                    onChange={(event) => setNewMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    style={{ marginBottom: 0 }}
                    disabled={sending}
                  />
                  <Button
                    text={sending ? "..." : "Envoyer"}
                    className="btn-primary"
                    onClick={handleSendMessage}
                    disabled={sending || !newMessage.trim()}
                  />
                </div>
              </>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-muted)",
                }}
              >
                Selectionnez une conversation.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;
