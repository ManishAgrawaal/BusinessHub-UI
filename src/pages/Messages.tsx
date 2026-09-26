import {
  Paperclip,
  Search,
  Send,
  MoreVertical,
  UserCircle,
  CheckCheck,
  RefreshCw,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const INDIA_TIME_ZONE = "Asia/Kolkata";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Conversation {
  userId: number;
  userName: string;
  projectId?: number | null;
  projectName?: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Message {
  messageId: number;
  senderUserId: number;
  senderName: string;
  receiverUserId: number;
  receiverName: string;
  projectId?: number | null;
  projectName?: string | null;
  subject?: string | null;
  messageText: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
}

interface ConversationsResponse {
  success: boolean;
  conversations: Conversation[];
}

interface ConversationResponse {
  success: boolean;
  currentUserId: number;
  otherUserId: number;
  otherUserName: string;
  messages: Message[];
}

interface SendMessageResponse {
  success: boolean;
  message: string;
  messageId: number;
  senderUserId: number;
  receiverUserId: number;
  projectId?: number | null;
  subject?: string | null;
  messageText: string;
  isRead: boolean;
  createdAt: string;
}

function getAuthToken(): string | null {
  return (
    localStorage.getItem("mts_token") ||
    sessionStorage.getItem("mts_token")
  );
}

function parseApiDate(date?: string | null): Date | null {
  if (!date) {
    return null;
  }

  let normalizedDate = date.trim();

  if (!normalizedDate) {
    return null;
  }

  // Backend timestamps are UTC.
  // If timezone is missing, treat the value as UTC.
  if (
    !normalizedDate.endsWith("Z") &&
    !/[+-]\d{2}:\d{2}$/.test(normalizedDate)
  ) {
    normalizedDate = `${normalizedDate}Z`;
  }

  const parsedDate = new Date(normalizedDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

function formatTime(date?: string | null): string {
  const parsedDate = parseApiDate(date);

  if (!parsedDate) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: INDIA_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(parsedDate);
}

function formatConversationTime(
  date?: string | null
): string {
  const parsedDate = parseApiDate(date);

  if (!parsedDate) {
    return "";
  }

  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: INDIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const todayParts = formatter.formatToParts(new Date());
  const messageParts = formatter.formatToParts(parsedDate);

  const todayYear = Number(
    todayParts.find((x) => x.type === "year")?.value
  );

  const todayMonth = Number(
    todayParts.find((x) => x.type === "month")?.value
  );

  const todayDay = Number(
    todayParts.find((x) => x.type === "day")?.value
  );

  const messageYear = Number(
    messageParts.find((x) => x.type === "year")?.value
  );

  const messageMonth = Number(
    messageParts.find((x) => x.type === "month")?.value
  );

  const messageDay = Number(
    messageParts.find((x) => x.type === "day")?.value
  );

  const isToday =
    todayYear === messageYear &&
    todayMonth === messageMonth &&
    todayDay === messageDay;

  if (isToday) {
    return formatTime(date);
  }

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: INDIA_TIME_ZONE,
    day: "2-digit",
    month: "short",
  }).format(parsedDate);
}

function formatMessageDate(
  date?: string | null
): string {
  const parsedDate = parseApiDate(date);

  if (!parsedDate) {
    return "";
  }

  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: INDIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const todayParts = formatter.formatToParts(new Date());
  const messageParts = formatter.formatToParts(parsedDate);

  const todayYear = Number(
    todayParts.find((x) => x.type === "year")?.value
  );

  const todayMonth = Number(
    todayParts.find((x) => x.type === "month")?.value
  );

  const todayDay = Number(
    todayParts.find((x) => x.type === "day")?.value
  );

  const messageYear = Number(
    messageParts.find((x) => x.type === "year")?.value
  );

  const messageMonth = Number(
    messageParts.find((x) => x.type === "month")?.value
  );

  const messageDay = Number(
    messageParts.find((x) => x.type === "day")?.value
  );

  const isToday =
    todayYear === messageYear &&
    todayMonth === messageMonth &&
    todayDay === messageDay;

  if (isToday) {
    return "Today";
  }

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: INDIA_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

export default function Messages() {
  const [message, setMessage] = useState("");

  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [selectedUserId, setSelectedUserId] =
    useState<number | null>(null);

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [currentUserId, setCurrentUserId] =
    useState<number | null>(null);

  const [loadingConversations, setLoadingConversations] =
    useState(true);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  const [searchText, setSearchText] =
    useState("");

  /*
   * Initial conversation loading.
   * Loader is shown only here.
   */
  useEffect(() => {
    loadConversations(true);
  }, []);

  /*
   * Load selected conversation when
   * user selects a conversation.
   */
  useEffect(() => {
    if (!selectedUserId) {
      return;
    }

    loadConversation(selectedUserId, true);
  }, [selectedUserId]);

  /*
   * REAL-TIME POLLING
   *
   * Refreshes conversations and selected chat
   * every 2 seconds.
   *
   * IMPORTANT:
   * false = silent refresh.
   *
   * Therefore the loading spinner is NOT shown
   * every 2 seconds and the page will not blink.
   */
  useEffect(() => {
    if (!selectedUserId) {
      return;
    }

    const interval = window.setInterval(async () => {
      await loadConversations(false);
      await loadConversation(
        selectedUserId,
        false
      );
    }, 2000);

    return () => {
      window.clearInterval(interval);
    };
  }, [selectedUserId]);

  /*
   * LOAD CONVERSATIONS
   *
   * showLoader = true
   *     Initial/manual loading
   *
   * showLoader = false
   *     Background polling
   */
  async function loadConversations(
    showLoader: boolean = true
  ) {
    try {
      if (showLoader) {
        setLoadingConversations(true);
      }

      setError("");

      const token = getAuthToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/Messages/my-conversations`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Session expired. Please login again."
          );
        }

        if (response.status === 403) {
          throw new Error(
            "You are not authorized to view messages."
          );
        }

        throw new Error(
          `Unable to load conversations. Status: ${response.status}`
        );
      }

      const result: ConversationsResponse =
        await response.json();

      if (!result.success) {
        throw new Error(
          "Unable to load conversations."
        );
      }

      const conversationList =
        result.conversations ?? [];

      setConversations(conversationList);

      /*
       * Keep the current conversation selected.
       *
       * If it no longer exists, select the first
       * available conversation.
       */
      setSelectedUserId(
        (currentSelectedUserId) => {
          if (
            currentSelectedUserId &&
            conversationList.some(
              (x) =>
                x.userId === currentSelectedUserId
            )
          ) {
            return currentSelectedUserId;
          }

          if (conversationList.length > 0) {
            return conversationList[0].userId;
          }

          return null;
        }
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load conversations."
      );
    } finally {
      if (showLoader) {
        setLoadingConversations(false);
      }
    }
  }

  /*
   * LOAD CONVERSATION
   *
   * showLoader = true
   *     When user opens/selects conversation
   *
   * showLoader = false
   *     During background polling
   */
  async function loadConversation(
    userId: number,
    showLoader: boolean = true
  ) {
    try {
      if (showLoader) {
        setLoadingMessages(true);
      }

      /*
       * Do not clear an existing error during
       * silent polling.
       */
      if (showLoader) {
        setError("");
      }

      const token = getAuthToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      /*
       * Cache-busting parameter ensures that
       * browser cache never returns old messages.
       */
      const response = await fetch(
        `${API_BASE_URL}/Messages/conversation/${userId}?t=${Date.now()}`,
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Session expired. Please login again."
          );
        }

        if (response.status === 403) {
          throw new Error(
            "You are not authorized to view this conversation."
          );
        }

        if (response.status === 404) {
          throw new Error(
            "Conversation user not found."
          );
        }

        throw new Error(
          `Unable to load messages. Status: ${response.status}`
        );
      }

      const result: ConversationResponse =
        await response.json();

      if (!result.success) {
        throw new Error(
          "Unable to load conversation."
        );
      }

      setCurrentUserId(
        result.currentUserId
      );

      const conversationMessages =
        result.messages ?? [];

      /*
       * Update messages without changing
       * loading state during polling.
       */
      setMessages(conversationMessages);

      /*
       * Mark received unread messages as read.
       */
      await markUnreadMessagesAsRead(
        conversationMessages,
        result.currentUserId
      );

      /*
       * Update unread count locally.
       */
      setConversations((current) =>
        current.map((conversation) =>
          conversation.userId === userId
            ? {
                ...conversation,
                unreadCount: 0,
              }
            : conversation
        )
      );
    } catch (error) {
      /*
       * During background polling we don't want
       * a temporary network issue to constantly
       * flash an error message.
       */
      if (showLoader) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load messages."
        );
      }
    } finally {
      if (showLoader) {
        setLoadingMessages(false);
      }
    }
  }

  /*
   * MARK UNREAD MESSAGES AS READ
   */
  async function markUnreadMessagesAsRead(
    conversationMessages: Message[],
    userId: number
  ) {
    const token = getAuthToken();

    if (!token) {
      return;
    }

    const unreadMessages =
      conversationMessages.filter(
        (item) =>
          item.receiverUserId === userId &&
          !item.isRead
      );

    if (unreadMessages.length === 0) {
      return;
    }

    await Promise.all(
      unreadMessages.map(async (item) => {
        try {
          await fetch(
            `${API_BASE_URL}/Messages/${item.messageId}/read`,
            {
              method: "PUT",
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } catch {
          /*
           * Keep chat usable if read-status
           * update fails.
           */
        }
      })
    );

    setMessages((current) =>
      current.map((item) =>
        item.receiverUserId === userId
          ? {
              ...item,
              isRead: true,
            }
          : item
      )
    );
  }

  /*
   * SEND MESSAGE
   */
  async function handleSend() {
    if (!message.trim()) {
      return;
    }

    if (!selectedUserId) {
      return;
    }

    try {
      setSending(true);
      setError("");

      const token = getAuthToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const selectedConversation =
        conversations.find(
          (conversation) =>
            conversation.userId ===
            selectedUserId
        );

      const response = await fetch(
        `${API_BASE_URL}/Messages`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            receiverUserId:
              selectedUserId,

            projectId:
              selectedConversation?.projectId ??
              null,

            subject: null,

            messageText:
              message.trim(),
          }),
        }
      );

      const result: SendMessageResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to send message."
        );
      }

      /*
       * Immediately display sent message.
       * We don't wait for polling.
       */
      const newMessage: Message = {
        messageId:
          result.messageId,

        senderUserId:
          result.senderUserId,

        senderName: "You",

        receiverUserId:
          result.receiverUserId,

        receiverName:
          selectedConversation?.userName ??
          "",

        projectId:
          result.projectId,

        projectName:
          selectedConversation?.projectName ??
          null,

        subject:
          result.subject,

        messageText:
          result.messageText,

        isRead:
          result.isRead,

        createdAt:
          result.createdAt,

        readAt: null,
      };

      setMessages((current) => [
        ...current,
        newMessage,
      ]);

      /*
       * Update conversation preview
       * immediately.
       */
      setConversations((current) =>
        current.map((conversation) =>
          conversation.userId ===
          selectedUserId
            ? {
                ...conversation,
                lastMessage:
                  result.messageText,
                lastMessageTime:
                  result.createdAt,
              }
            : conversation
        )
      );

      setMessage("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  }

  /*
   * SELECTED CONVERSATION
   */
  const selectedConversation =
    useMemo(() => {
      return conversations.find(
        (conversation) =>
          conversation.userId ===
          selectedUserId
      );
    }, [
      conversations,
      selectedUserId,
    ]);

  /*
   * SEARCH
   */
  const filteredConversations =
    useMemo(() => {
      const search =
        searchText
          .trim()
          .toLowerCase();

      if (!search) {
        return conversations;
      }

      return conversations.filter(
        (conversation) =>
          conversation.userName
            .toLowerCase()
            .includes(search) ||
          (
            conversation.projectName ??
            ""
          )
            .toLowerCase()
            .includes(search) ||
          conversation.lastMessage
            .toLowerCase()
            .includes(search)
      );
    }, [
      conversations,
      searchText,
    ]);

  /*
   * TOTAL UNREAD
   */
  const totalUnread =
    useMemo(() => {
      return conversations.reduce(
        (total, conversation) =>
          total +
          conversation.unreadCount,
        0
      );
    }, [conversations]);

  return (
    <main className="py-4">
      <div className="container-fluid px-4">

        {/* PAGE HEADER */}
        <div className="mb-4">

          <div className="small text-uppercase text-secondary fw-semibold mb-1">
            CLIENT PORTAL
          </div>

          <h1 className="h3 fw-bold mb-1">
            Messages
          </h1>

          <p className="text-secondary mb-0">
            Communicate with your MTS project team.
          </p>

        </div>

        {/* ERROR */}
        {error && (
          <div className="alert alert-danger rounded-4 mb-4">

            <div className="d-flex justify-content-between align-items-center gap-3">

              <div>

                <div className="fw-semibold mb-1">
                  Messages error
                </div>

                <div className="small">
                  {error}
                </div>

              </div>

              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() =>
                  loadConversations(true)
                }
              >
                <RefreshCw
                  size={15}
                  className="me-1"
                />

                Retry
              </button>

            </div>

          </div>
        )}

        {/* MESSAGES CARD */}
        <div
          className="card border-0 shadow-sm rounded-4 overflow-hidden"
          style={{
            minHeight: "650px",
          }}
        >

          <div className="row g-0 h-100">

            {/* CONVERSATIONS */}
            <div className="col-lg-4 col-xl-3 border-end">

              <div className="p-3 border-bottom">

                <div className="d-flex justify-content-between align-items-center mb-3">

                  <h2 className="h6 fw-bold mb-0">
                    Conversations
                  </h2>

                  {totalUnread > 0 && (
                    <span className="badge bg-primary-subtle text-primary rounded-pill">
                      {totalUnread} New
                    </span>
                  )}

                </div>

                {/* SEARCH */}
                <div className="input-group">

                  <span className="input-group-text bg-light border-0">
                    <Search size={17} />
                  </span>

                  <input
                    type="text"
                    className="form-control bg-light border-0"
                    placeholder="Search messages..."
                    value={searchText}
                    onChange={(e) =>
                      setSearchText(
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

              {/* CONVERSATION LOADING */}
              {loadingConversations && (
                <div className="text-center py-5">

                  <div
                    className="spinner-border spinner-border-sm text-primary"
                    role="status"
                  >
                    <span className="visually-hidden">
                      Loading...
                    </span>
                  </div>

                  <div className="small text-secondary mt-2">
                    Loading conversations...
                  </div>

                </div>
              )}

              {/* EMPTY */}
              {!loadingConversations &&
                filteredConversations.length ===
                  0 && (
                  <div className="text-center p-4">

                    <UserCircle
                      size={38}
                      className="text-secondary mb-2"
                    />

                    <div className="fw-semibold">
                      No conversations
                    </div>

                    <div className="small text-secondary mt-1">
                      No messages found.
                    </div>

                  </div>
                )}

              {/* CONVERSATION LIST */}
              {!loadingConversations &&
                filteredConversations.map(
                  (conversation) => (
                    <button
                      key={
                        conversation.userId
                      }
                      type="button"
                      className={`w-100 border-0 border-bottom text-start p-3 ${
                        selectedUserId ===
                        conversation.userId
                          ? "bg-primary bg-opacity-10"
                          : "bg-white"
                      }`}
                      onClick={() =>
                        setSelectedUserId(
                          conversation.userId
                        )
                      }
                    >

                      <div className="d-flex">

                        {/* AVATAR */}
                        <div className="flex-shrink-0">

                          <div
                            className={`rounded-circle d-flex align-items-center justify-content-center ${
                              selectedUserId ===
                              conversation.userId
                                ? "bg-primary text-white"
                                : "bg-light text-primary"
                            }`}
                            style={{
                              width: "44px",
                              height: "44px",
                            }}
                          >
                            <UserCircle
                              size={22}
                            />
                          </div>

                        </div>

                        {/* CONTENT */}
                        <div className="ms-3 flex-grow-1 overflow-hidden">

                          <div className="d-flex justify-content-between">

                            <div className="fw-semibold text-truncate">
                              {
                                conversation.userName
                              }
                            </div>

                            <small className="text-secondary ms-2">
                              {formatConversationTime(
                                conversation.lastMessageTime
                              )}
                            </small>

                          </div>

                          <div className="small text-primary mb-1 text-truncate">
                            {
                              conversation.projectName ||
                              "General"
                            }
                          </div>

                          <div className="d-flex justify-content-between align-items-center">

                            <div className="small text-secondary text-truncate">
                              {
                                conversation.lastMessage
                              }
                            </div>

                            {conversation.unreadCount >
                              0 && (
                              <span className="badge bg-primary rounded-pill ms-2">
                                {
                                  conversation.unreadCount
                                }
                              </span>
                            )}

                          </div>

                        </div>

                      </div>

                    </button>
                  )
                )}

            </div>

            {/* CHAT AREA */}
            <div className="col-lg-8 col-xl-9 d-flex flex-column">

              {/* CHAT HEADER */}
              <div className="d-flex align-items-center justify-content-between p-3 border-bottom">

                <div className="d-flex align-items-center">

                  <div
                    className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center"
                    style={{
                      width: "44px",
                      height: "44px",
                    }}
                  >
                    <UserCircle
                      size={23}
                    />
                  </div>

                  <div className="ms-3">

                    <div className="fw-bold">
                      {
                        selectedConversation?.userName ||
                        "Select a conversation"
                      }
                    </div>

                    <div className="small text-success">
                      {selectedConversation
                        ? "Project team"
                        : "No conversation selected"}
                    </div>

                  </div>

                </div>

                <button
                  type="button"
                  className="btn btn-light"
                  aria-label="More options"
                >
                  <MoreVertical
                    size={19}
                  />
                </button>

              </div>

              {/* PROJECT INFO */}
              {selectedConversation && (
                <div className="bg-light border-bottom px-4 py-3">

                  <div className="row align-items-center g-3">

                    <div className="col">

                      <div className="small text-secondary">
                        Project
                      </div>

                      <div className="small fw-semibold">
                        {
                          selectedConversation.projectName ||
                          "General"
                        }
                      </div>

                    </div>

                  </div>

                </div>
              )}

              {/* MESSAGE HISTORY */}
              <div
                className="flex-grow-1 p-4 overflow-auto"
                style={{
                  minHeight: "400px",
                  maxHeight: "470px",
                }}
              >

                {/* NO CONVERSATION */}
                {!selectedConversation && (
                  <div className="h-100 d-flex align-items-center justify-content-center text-center">

                    <div>

                      <UserCircle
                        size={50}
                        className="text-secondary mb-3"
                      />

                      <h3 className="h6 fw-bold">
                        Select a conversation
                      </h3>

                      <p className="small text-secondary mb-0">
                        Select a conversation from the left.
                      </p>

                    </div>

                  </div>
                )}

                {/* LOADING */}
                {selectedConversation &&
                  loadingMessages && (
                    <div className="text-center py-5">

                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">
                          Loading...
                        </span>
                      </div>

                      <div className="small text-secondary mt-3">
                        Loading messages...
                      </div>

                    </div>
                  )}

                {/* EMPTY */}
                {selectedConversation &&
                  !loadingMessages &&
                  messages.length ===
                    0 && (
                    <div className="h-100 d-flex align-items-center justify-content-center text-center">

                      <div>

                        <Send
                          size={40}
                          className="text-secondary mb-3"
                        />

                        <h3 className="h6 fw-bold">
                          No messages yet
                        </h3>

                        <p className="small text-secondary mb-0">
                          Start the conversation with your project team.
                        </p>

                      </div>

                    </div>
                  )}

                {/* MESSAGE LIST */}
                {selectedConversation &&
                  !loadingMessages &&
                  messages.length > 0 && (
                    <>
                      {messages.map(
                        (item, index) => {

                          const isMine =
                            item.senderUserId ===
                            currentUserId;

                          const previousMessage =
                            messages[
                              index - 1
                            ];

                          const currentDate =
                            formatMessageDate(
                              item.createdAt
                            );

                          const previousDate =
                            previousMessage
                              ? formatMessageDate(
                                  previousMessage.createdAt
                                )
                              : "";

                          const showDate =
                            currentDate !==
                            previousDate;

                          return (
                            <div
                              key={
                                item.messageId
                              }
                            >

                              {/* DATE */}
                              {showDate && (
                                <div className="text-center mb-4">

                                  <span className="badge bg-light text-secondary fw-normal">
                                    {
                                      currentDate
                                    }
                                  </span>

                                </div>
                              )}

                              {/* MY MESSAGE */}
                              {isMine ? (
                                <div className="d-flex justify-content-end mb-4">

                                  <div className="text-end">

                                    <div className="small fw-semibold mb-1">
                                      You
                                    </div>

                                    <div
                                      className="bg-primary text-white rounded-4 p-3 text-start"
                                      style={{
                                        maxWidth:
                                          "550px",
                                      }}
                                    >
                                      <p className="small mb-0">
                                        {
                                          item.messageText
                                        }
                                      </p>
                                    </div>

                                    <div className="small text-secondary mt-1">

                                      {formatTime(
                                        item.createdAt
                                      )}

                                      <CheckCheck
                                        size={
                                          14
                                        }
                                        className="ms-1 text-primary"
                                      />

                                    </div>

                                  </div>

                                </div>
                              ) : (
                                /* TEAM MESSAGE */
                                <div className="d-flex mb-4">

                                  <div
                                    className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                                    style={{
                                      width:
                                        "38px",
                                      height:
                                        "38px",
                                    }}
                                  >
                                    <UserCircle
                                      size={20}
                                    />
                                  </div>

                                  <div className="ms-3">

                                    <div className="small fw-semibold mb-1">
                                      {
                                        item.senderName
                                      }
                                    </div>

                                    <div
                                      className="bg-light rounded-4 p-3"
                                      style={{
                                        maxWidth:
                                          "550px",
                                      }}
                                    >
                                      <p className="small mb-0">
                                        {
                                          item.messageText
                                        }
                                      </p>
                                    </div>

                                    <div className="small text-secondary mt-1">
                                      {formatTime(
                                        item.createdAt
                                      )}
                                    </div>

                                  </div>

                                </div>
                              )}

                            </div>
                          );
                        }
                      )}
                    </>
                  )}

              </div>

              {/* MESSAGE INPUT */}
              <div className="border-top p-3">

                <div className="input-group">

                  {/* ATTACHMENT */}
                  <button
                    type="button"
                    className="btn btn-light border"
                    title="Attach file"
                    disabled={
                      !selectedConversation
                    }
                  >
                    <Paperclip
                      size={19}
                    />
                  </button>

                  {/* MESSAGE */}
                  <input
                    type="text"
                    className="form-control"
                    placeholder={
                      selectedConversation
                        ? "Write a message..."
                        : "Select a conversation..."
                    }
                    value={message}
                    disabled={
                      !selectedConversation ||
                      sending
                    }
                    onChange={(e) =>
                      setMessage(
                        e.target.value
                      )
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key ===
                          "Enter" &&
                        !e.shiftKey
                      ) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />

                  {/* SEND */}
                  <button
                    type="button"
                    className="btn btn-primary px-4"
                    disabled={
                      !selectedConversation ||
                      !message.trim() ||
                      sending
                    }
                    onClick={handleSend}
                  >
                    {sending ? (
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                      />
                    ) : (
                      <Send
                        size={18}
                      />
                    )}
                  </button>

                </div>

                <div className="small text-secondary mt-2">
                  Press Enter to send your message.
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
