import {
  Paperclip,
  Search,
  Send,
  MoreVertical,
  UserCircle,
  CheckCheck,
  RefreshCw,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const INDIA_TIME_ZONE = "Asia/Kolkata";

// ============================================================
// INTERFACES
// ============================================================

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

interface MessagesResponse {
  success: boolean;
  messages: Message[];
}

interface SendMessageResponse {
  success: boolean;
  message: string;
  messageId: number;
  senderUserId: number;
  receiverUserId: number;
  projectId?: number | null;
  projectName?: string | null;
  subject?: string | null;
  messageText: string;
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  userId: number;
  userName: string;
  projectId?: number | null;
  projectName?: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

interface CurrentUserResponse {
  success: boolean;
  userId: string | number;
  fullName?: string;
  email?: string;
  role?: string;
}

// ============================================================
// AUTH TOKEN
// ============================================================

function getAuthToken(): string | null {
  return (
    localStorage.getItem("mts_token") ||
    sessionStorage.getItem("mts_token")
  );
}

// ============================================================
// DATE PARSER
//
// Backend uses DateTime.UtcNow.
//
// If API returns:
// 2026-09-21T16:51:00Z
// -> UTC
//
// If API returns:
// 2026-09-21T16:51:00
// -> We treat it as UTC as well.
// ============================================================

function parseApiDate(
  date?: string | null
): Date | null {
  if (!date) {
    return null;
  }

  let normalizedDate = date.trim();

  if (!normalizedDate) {
    return null;
  }

  const hasTimezone =
    normalizedDate.endsWith("Z") ||
    /[+-]\d{2}:\d{2}$/.test(
      normalizedDate
    );

  if (!hasTimezone) {
    normalizedDate =
      `${normalizedDate}Z`;
  }

  const parsedDate =
    new Date(normalizedDate);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return null;
  }

  return parsedDate;
}

// ============================================================
// FORMAT TIME - INDIA
//
// Example:
// 10:21 PM
// ============================================================

function formatTime(
  date?: string | null
): string {
  const parsedDate =
    parseApiDate(date);

  if (!parsedDate) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      timeZone:
        INDIA_TIME_ZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  ).format(parsedDate);
}

// ============================================================
// GET INDIA DATE PARTS
// ============================================================

function getIndiaDateParts(
  date: Date
) {
  const parts =
    new Intl.DateTimeFormat(
      "en-IN",
      {
        timeZone:
          INDIA_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    ).formatToParts(date);

  const getPart = (
    type: string
  ) =>
    parts.find(
      (part) =>
        part.type === type
    )?.value;

  return {
    year: getPart("year"),
    month: getPart("month"),
    day: getPart("day"),
  };
}

// ============================================================
// CHECK WHETHER DATE IS TODAY IN INDIA
// ============================================================

function isTodayInIndia(
  date: Date
): boolean {
  const todayParts =
    getIndiaDateParts(
      new Date()
    );

  const messageParts =
    getIndiaDateParts(date);

  return (
    todayParts.year ===
      messageParts.year &&
    todayParts.month ===
      messageParts.month &&
    todayParts.day ===
      messageParts.day
  );
}

// ============================================================
// FORMAT CONVERSATION TIME
//
// Today:
// 10:21 PM
//
// Older:
// 21 Sep
// ============================================================

function formatConversationTime(
  date?: string | null
): string {
  const parsedDate =
    parseApiDate(date);

  if (!parsedDate) {
    return "";
  }

  if (
    isTodayInIndia(
      parsedDate
    )
  ) {
    return formatTime(date);
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      timeZone:
        INDIA_TIME_ZONE,
      day: "2-digit",
      month: "short",
    }
  ).format(parsedDate);
}

// ============================================================
// FORMAT MESSAGE DATE
//
// Today:
// Today
//
// Older:
// 21 Sep 2026
// ============================================================

function formatMessageDate(
  date?: string | null
): string {
  const parsedDate =
    parseApiDate(date);

  if (!parsedDate) {
    return "";
  }

  if (
    isTodayInIndia(
      parsedDate
    )
  ) {
    return "Today";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      timeZone:
        INDIA_TIME_ZONE,
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(parsedDate);
}

// ============================================================
// COMPONENT
// ============================================================

export default function AdminMessages() {
  const [message, setMessage] =
    useState("");

  const [allMessages, setAllMessages] =
    useState<Message[]>([]);

  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [selectedUserId, setSelectedUserId] =
    useState<number | null>(null);

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [currentUserId, setCurrentUserId] =
    useState<number | null>(null);

  const [
    loadingConversations,
    setLoadingConversations,
  ] = useState(true);

  const [
    loadingMessages,
    setLoadingMessages,
  ] = useState(false);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  const [searchText, setSearchText] =
    useState("");

  const pollingRef =
    useRef(false);

  const sendingRef =
    useRef(false);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadCurrentUser();
    loadAdminMessages();
  }, []);

  // ============================================================
  // BACKGROUND POLLING - NO MANUAL REFRESH REQUIRED
  // ============================================================

  useEffect(() => {
    if (currentUserId === null) {
      return;
    }

    const pollMessages = async () => {
      if (pollingRef.current || sendingRef.current) {
        return;
      }

      pollingRef.current = true;

      try {
        const token = getAuthToken();

        if (!token) {
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/Messages?_t=${Date.now()}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const result: MessagesResponse =
          await response.json();

        if (!result.success) {
          return;
        }

        const latestMessages = result.messages ?? [];

        setAllMessages(latestMessages);

        const latestConversations =
          buildConversations(latestMessages, currentUserId);

        setConversations(latestConversations);

        if (selectedUserId !== null) {
          const selectedExists = latestConversations.some(
            (conversation) =>
              conversation.userId === selectedUserId
          );

          if (selectedExists) {
            const latestConversationMessages = latestMessages
              .filter(
                (item) =>
                  item.senderUserId === selectedUserId ||
                  item.receiverUserId === selectedUserId
              )
              .sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              );

            setMessages(latestConversationMessages);
          }
        } else if (latestConversations.length > 0) {
          setSelectedUserId(
            latestConversations[0].userId
          );
        }
      } catch {
        // Silent polling failure.
      } finally {
        pollingRef.current = false;
      }
    };

    pollMessages();

    const interval = window.setInterval(
      pollMessages,
      2000
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [currentUserId, selectedUserId]);

  // ============================================================
  // LOAD CURRENT ADMIN
  // ============================================================

  async function loadCurrentUser() {
    try {
      const token =
        getAuthToken();

      if (!token) {
        return;
      }

      const response =
        await fetch(
          `${API_BASE_URL}/Auth/me`,
          {
            method: "GET",
            headers: {
              Accept:
                "application/json",
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (!response.ok) {
        return;
      }

      const result: CurrentUserResponse =
        await response.json();

      if (result.success) {
        const userId =
          Number(result.userId);

        if (
          Number.isInteger(
            userId
          )
        ) {
          setCurrentUserId(
            userId
          );
        }
      }
    } catch {
      // Current user ID is only required for UI alignment.
    }
  }

  // ============================================================
  // LOAD ALL ADMIN MESSAGES
  // ============================================================

  async function loadAdminMessages() {
    try {
      setLoadingConversations(
        true
      );

      setError("");

      const token =
        getAuthToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const response =
        await fetch(
          `${API_BASE_URL}/Messages`,
          {
            method: "GET",
            headers: {
              Accept:
                "application/json",
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (!response.ok) {
        if (
          response.status === 401
        ) {
          throw new Error(
            "Session expired. Please login again."
          );
        }

        if (
          response.status === 403
        ) {
          throw new Error(
            "You are not authorized to view messages."
          );
        }

        throw new Error(
          `Unable to load messages. Status: ${response.status}`
        );
      }

      const result: MessagesResponse =
        await response.json();

      if (!result.success) {
        throw new Error(
          "Unable to load messages."
        );
      }

      const messageList =
        result.messages ?? [];

      setAllMessages(
        messageList
      );

      const grouped =
        buildConversations(
          messageList,
          currentUserId
        );

      setConversations(
        grouped
      );

      if (
        grouped.length > 0
      ) {
        setSelectedUserId(
          (currentSelectedUserId) => {
            const stillExists =
              currentSelectedUserId !==
                null &&
              grouped.some(
                (conversation) =>
                  conversation.userId ===
                  currentSelectedUserId
              );

            return stillExists
              ? currentSelectedUserId
              : grouped[0].userId;
          }
        );
      } else {
        setSelectedUserId(
          null
        );

        setMessages([]);
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load messages."
      );
    } finally {
      setLoadingConversations(
        false
      );
    }
  }

  // ============================================================
  // BUILD CONVERSATIONS
  // ============================================================

  function buildConversations(
    messageList: Message[],
    adminUserId: number | null
  ): Conversation[] {
    const map =
      new Map<
        number,
        Conversation
      >();

    const sortedMessages =
      [...messageList].sort(
        (a, b) =>
          new Date(
            a.createdAt
          ).getTime() -
          new Date(
            b.createdAt
          ).getTime()
      );

    sortedMessages.forEach(
      (item) => {
        const otherUserId =
          adminUserId !== null
            ? item.senderUserId ===
              adminUserId
              ? item.receiverUserId
              : item.senderUserId
            : item.senderUserId;

        const otherUserName =
          adminUserId !== null
            ? item.senderUserId ===
              adminUserId
              ? item.receiverName
              : item.senderName
            : item.senderName;

        const existing =
          map.get(
            otherUserId
          );

        const isIncoming =
          adminUserId !== null &&
          item.receiverUserId ===
            adminUserId;

        if (!existing) {
          map.set(
            otherUserId,
            {
              userId:
                otherUserId,

              userName:
                otherUserName,

              projectId:
                item.projectId,

              projectName:
                item.projectName,

              lastMessage:
                item.messageText,

              lastMessageTime:
                item.createdAt,

              unreadCount:
                isIncoming &&
                !item.isRead
                  ? 1
                  : 0,

              messages: [
                item,
              ],
            }
          );
        } else {
          existing.messages.push(
            item
          );

          if (
            new Date(
              item.createdAt
            ).getTime() >
            new Date(
              existing.lastMessageTime
            ).getTime()
          ) {
            existing.lastMessage =
              item.messageText;

            existing.lastMessageTime =
              item.createdAt;

            existing.projectId =
              item.projectId;

            existing.projectName =
              item.projectName;
          }

          if (
            isIncoming &&
            !item.isRead
          ) {
            existing.unreadCount +=
              1;
          }
        }
      }
    );

    return Array.from(
      map.values()
    ).sort(
      (a, b) =>
        new Date(
          b.lastMessageTime
        ).getTime() -
        new Date(
          a.lastMessageTime
        ).getTime()
    );
  }

  // ============================================================
  // LOAD SELECTED CONVERSATION
  // ============================================================

  useEffect(() => {
    if (selectedUserId === null) {
      setMessages([]);
      return;
    }

    const conversationMessages = allMessages
      .filter(
        (item) =>
          item.senderUserId === selectedUserId ||
          item.receiverUserId === selectedUserId
      )
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
      );

    setMessages(conversationMessages);

    markUnreadMessagesAsRead(
      conversationMessages,
      selectedUserId
    );
  }, [selectedUserId]);

  // ============================================================
  // LOAD CONVERSATION
  // ============================================================

  async function loadConversation(
    userId: number
  ) {
    try {
      setLoadingMessages(
        true
      );

      setError("");

      const conversationMessages =
        allMessages
          .filter(
            (item) =>
              item.senderUserId ===
                userId ||
              item.receiverUserId ===
                userId
          )
          .sort(
            (a, b) =>
              new Date(
                a.createdAt
              ).getTime() -
              new Date(
                b.createdAt
              ).getTime()
          );

      setMessages(
        conversationMessages
      );

      await markUnreadMessagesAsRead(
        conversationMessages,
        userId
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load conversation."
      );
    } finally {
      setLoadingMessages(
        false
      );
    }
  }

  // ============================================================
  // MARK UNREAD MESSAGES AS READ
  // ============================================================

  async function markUnreadMessagesAsRead(
    conversationMessages: Message[],
    userId: number
  ) {
    const token =
      getAuthToken();

    if (
      !token ||
      currentUserId === null
    ) {
      return;
    }

    const unreadMessages =
      conversationMessages.filter(
        (item) =>
          item.receiverUserId ===
            currentUserId &&
          item.senderUserId ===
            userId &&
          !item.isRead
      );

    if (
      unreadMessages.length ===
      0
    ) {
      return;
    }

    await Promise.all(
      unreadMessages.map(
        async (item) => {
          try {
            await fetch(
              `${API_BASE_URL}/Messages/${item.messageId}/read`,
              {
                method:
                  "PUT",

                headers: {
                  Accept:
                    "application/json",

                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );
          } catch {
            // Keep chat usable.
          }
        }
      )
    );

    setMessages(
      (current) =>
        current.map(
          (item) =>
            unreadMessages.some(
              (unread) =>
                unread.messageId ===
                item.messageId
            )
              ? {
                  ...item,
                  isRead: true,
                }
              : item
        )
    );

    setAllMessages(
      (current) =>
        current.map(
          (item) =>
            unreadMessages.some(
              (unread) =>
                unread.messageId ===
                item.messageId
            )
              ? {
                  ...item,
                  isRead: true,
                }
              : item
        )
    );

    setConversations(
      (current) =>
        current.map(
          (conversation) =>
            conversation.userId ===
            userId
              ? {
                  ...conversation,
                  unreadCount: 0,
                }
              : conversation
        )
    );
  }

  // ============================================================
  // SEND MESSAGE
  // ============================================================

  async function handleSend() {
    if (!message.trim()) {
      return;
    }

    if (
      selectedUserId === null
    ) {
      return;
    }

    try {
      sendingRef.current = true;
      setSending(true);
      setError("");

      const token =
        getAuthToken();

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

      const response =
        await fetch(
          `${API_BASE_URL}/Messages`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",

              Authorization:
                `Bearer ${token}`,
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

      const responseText = await response.text();

      let result: Partial<SendMessageResponse> & {
        message?: string;
      } = {};

      if (responseText) {
        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error(
            `Invalid server response. Status: ${response.status}`
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            `Unable to send message. Status: ${response.status}`
        );
      }

      if (result.success === false) {
        throw new Error(
          result.message ||
            "Unable to send message."
        );
      }

      if (!result.messageId || !result.createdAt) {
        throw new Error(
          "Message was not saved correctly by the server."
        );
      }

      const newMessage: Message =
        {
          messageId:
            result.messageId,

          senderUserId:
            result.senderUserId ??
            currentUserId ??
            0,

          senderName:
            "MTS Admin",

          receiverUserId:
            result.receiverUserId ??
            selectedUserId,

          receiverName:
            selectedConversation?.userName ??
            "",

          projectId:
            result.projectId ??
            selectedConversation?.projectId ??
            null,

          projectName:
            result.projectName ??
            selectedConversation?.projectName ??
            null,

          subject:
            result.subject,

          messageText:
            result.messageText ??
            message.trim(),

          isRead:
            result.isRead ??
            false,

          createdAt:
            result.createdAt,

          readAt: null,
        };

      setMessages(
        (current) => [
          ...current,
          newMessage,
        ]
      );

      setAllMessages(
        (current) => [
          ...current,
          newMessage,
        ]
      );

      setConversations(
        (current) =>
          current.map(
            (conversation) =>
              conversation.userId ===
              selectedUserId
                ? {
                    ...conversation,

                    lastMessage:
                      newMessage.messageText,

                    lastMessageTime:
                      newMessage.createdAt,

                    projectId:
                      newMessage.projectId ??
                      conversation.projectId,

                    projectName:
                      newMessage.projectName ??
                      conversation.projectName,
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
      sendingRef.current = false;
      setSending(false);
    }
  }

  // ============================================================
  // SELECTED CONVERSATION
  // ============================================================

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

  // ============================================================
  // FILTER CONVERSATIONS
  // ============================================================

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

  // ============================================================
  // TOTAL UNREAD
  // ============================================================

  const totalUnread =
    useMemo(() => {
      return conversations.reduce(
        (total, conversation) =>
          total +
          conversation.unreadCount,
        0
      );
    }, [conversations]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main className="py-4">
      <div className="container-fluid px-4">

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="d-flex justify-content-between align-items-start mb-4">

          <div>
            <div className="small text-uppercase text-primary fw-semibold mb-1">
              ADMIN PORTAL
            </div>

            <h1 className="h3 fw-bold mb-1">
              Messages
            </h1>

            <p className="text-secondary mb-0">
              Communicate with clients and manage project conversations.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={
              loadAdminMessages
            }
            disabled={
              loadingConversations
            }
          >
            <RefreshCw
              size={16}
              className="me-2"
            />

            {loadingConversations
              ? "Loading..."
              : "Refresh"}
          </button>

        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

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
                onClick={
                  loadAdminMessages
                }
              >
                Retry
              </button>

            </div>

          </div>
        )}

        {/* =====================================================
            MAIN MESSAGES CARD
        ===================================================== */}

        <div
          className="card border-0 shadow-sm rounded-4 overflow-hidden"
          style={{
            minHeight:
              "650px",
          }}
        >

          <div className="row g-0 h-100">

            {/* =================================================
                LEFT - CONVERSATIONS
            ================================================= */}

            <div className="col-lg-4 col-xl-3 border-end">

              <div className="p-3 border-bottom">

                <div className="d-flex justify-content-between align-items-center mb-3">

                  <h2 className="h6 fw-bold mb-0">
                    Client Conversations
                  </h2>

                  {totalUnread >
                    0 && (
                    <span className="badge bg-primary-subtle text-primary rounded-pill">
                      {totalUnread} New
                    </span>
                  )}

                </div>

                <div className="input-group">

                  <span className="input-group-text bg-light border-0">
                    <Search
                      size={17}
                    />
                  </span>

                  <input
                    type="text"
                    className="form-control bg-light border-0"
                    placeholder="Search client or project..."
                    value={
                      searchText
                    }
                    onChange={(
                      e
                    ) =>
                      setSearchText(
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

              {/* LOADING */}

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
                      size={40}
                      className="text-secondary mb-2"
                    />

                    <div className="fw-semibold">
                      No conversations
                    </div>

                    <div className="small text-secondary mt-1">
                      No client messages found.
                    </div>

                  </div>
                )}

              {/* CONVERSATIONS */}

              {!loadingConversations &&
                filteredConversations.map(
                  (
                    conversation
                  ) => (
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

                        <div className="flex-shrink-0">

                          <div
                            className={`rounded-circle d-flex align-items-center justify-content-center ${
                              selectedUserId ===
                              conversation.userId
                                ? "bg-primary text-white"
                                : "bg-light text-primary"
                            }`}
                            style={{
                              width:
                                "44px",
                              height:
                                "44px",
                            }}
                          >
                            <UserCircle
                              size={22}
                            />
                          </div>

                        </div>

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
                            {conversation.projectName ||
                              "General"}
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

            {/* =================================================
                RIGHT - CHAT
            ================================================= */}

            <div className="col-lg-8 col-xl-9 d-flex flex-column">

              {/* CHAT HEADER */}

              <div className="d-flex align-items-center justify-content-between p-3 border-bottom">

                <div className="d-flex align-items-center">

                  <div
                    className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center"
                    style={{
                      width:
                        "44px",
                      height:
                        "44px",
                    }}
                  >
                    <UserCircle
                      size={23}
                    />
                  </div>

                  <div className="ms-3">

                    <div className="fw-bold">
                      {selectedConversation?.userName ||
                        "Select a client"}
                    </div>

                    <div className="small text-success">
                      {selectedConversation
                        ? "Client"
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

                  <div className="small text-secondary">
                    Project
                  </div>

                  <div className="small fw-semibold">
                    {selectedConversation.projectName ||
                      "General"}
                  </div>

                </div>
              )}

              {/* =================================================
                  MESSAGE HISTORY
              ================================================= */}

              <div
                className="flex-grow-1 p-4 overflow-auto"
                style={{
                  minHeight:
                    "400px",
                  maxHeight:
                    "470px",
                }}
              >

                {!selectedConversation && (
                  <div className="h-100 d-flex align-items-center justify-content-center text-center">

                    <div>

                      <UserCircle
                        size={50}
                        className="text-secondary mb-3"
                      />

                      <h3 className="h6 fw-bold">
                        Select a client
                      </h3>

                      <p className="small text-secondary mb-0">
                        Select a client conversation from the left.
                      </p>

                    </div>

                  </div>
                )}

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
                          Start the conversation with this client.
                        </p>

                      </div>

                    </div>
                  )}

                {selectedConversation &&
                  !loadingMessages &&
                  messages.length >
                    0 && (
                    <>
                      {messages.map(
                        (
                          item,
                          index
                        ) => {

                          const isMine =
                            currentUserId !==
                              null &&
                            item.senderUserId ===
                              currentUserId;

                          const previousMessage =
                            messages[
                              index -
                                1
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

                              {/* ADMIN MESSAGE */}

                              {isMine ? (
                                <div className="d-flex justify-content-end mb-4">

                                  <div className="text-end">

                                    <div className="small fw-semibold mb-1">
                                      MTS Admin
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
                                /* CLIENT MESSAGE */

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
                                      size={
                                        20
                                      }
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

              {/* =================================================
                  MESSAGE INPUT
              ================================================= */}

              <div className="border-top p-3">

                <div className="input-group">

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

                  <input
                    type="text"
                    className="form-control"
                    placeholder={
                      selectedConversation
                        ? "Write a message to client..."
                        : "Select a client..."
                    }
                    value={
                      message
                    }
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

                  <button
                    type="button"
                    className="btn btn-primary px-4"
                    disabled={
                      !selectedConversation ||
                      !message.trim() ||
                      sending
                    }
                    onClick={
                      handleSend
                    }
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
