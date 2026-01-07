import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ChatPanel, { ChatMessage, SenderRole } from "@/components/ChatPanel";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import { sendMessage } from "@/app/lib/controllers/message.controller";

// Mock dependencies
jest.mock("next-auth/react");
jest.mock("socket.io-client");
jest.mock("@/app/lib/controllers/message.controller");

// Mock fetch
global.fetch = jest.fn();

// Mock Socket.IO
const mockSocket = {
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  disconnect: jest.fn(),
};

describe("ChatPanel", () => {
  const mockReportId = "123";
  const mockCurrentUserRole: SenderRole = "CITIZEN";
  const mockCurrentUserId = "user-1";

  beforeEach(() => {
    jest.clearAllMocks();
    (io as jest.Mock).mockReturnValue(mockSocket as any);
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: mockCurrentUserId,
          name: "Test User",
        },
      },
    });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render chat panel with title", async () => {
    render(
      <ChatPanel
        reportId={mockReportId}
        currentUserRole={mockCurrentUserRole}
        currentUserId={mockCurrentUserId}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Report Discussion")).toBeInTheDocument();
    });
  });

  it("should fetch and display initial messages", async () => {
    const mockMessages = [
      {
        id: "1",
        content: "Test message",
        author: {
          id: 1,
          username: "john_doe",
          firstName: "John",
          lastName: "Doe",
          role: "CITIZEN",
        },
        createdAt: new Date().toISOString(),
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMessages,
    });

    render(
      <ChatPanel
        reportId={mockReportId}
        currentUserRole={mockCurrentUserRole}
        currentUserId={mockCurrentUserId}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Test message")).toBeInTheDocument();
      expect(screen.getByText("john_doe")).toBeInTheDocument();
    });
  });

  it("should display loading state initially", () => {
    render(
      <ChatPanel
        reportId={mockReportId}
        currentUserRole={mockCurrentUserRole}
        currentUserId={mockCurrentUserId}
      />
    );

    expect(screen.getByText("Loading messages...")).toBeInTheDocument();
  });

  it("should setup WebSocket connection on mount", async () => {
    render(
      <ChatPanel
        reportId={mockReportId}
        currentUserRole={mockCurrentUserRole}
        currentUserId={mockCurrentUserId}
      />
    );

    await waitFor(() => {
      expect(io).toHaveBeenCalled();
      expect(mockSocket.emit).toHaveBeenCalledWith("join", mockReportId);
      expect(mockSocket.on).toHaveBeenCalledWith("chat-message", expect.any(Function));
    });
  });

  it("should send message on button click", async () => {
    (sendMessage as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        id: "2",
        content: "New message",
        createdAt: new Date().toISOString(),
      },
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(
      <ChatPanel
        reportId={mockReportId}
        currentUserRole={mockCurrentUserRole}
        currentUserId={mockCurrentUserId}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText("Loading messages...")).not.toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText("Type a message...");
    const buttons = screen.getAllByRole("button");
    const sendButton = buttons[buttons.length - 1]; // Last button is send button

    fireEvent.change(textarea, { target: { value: "New message" } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalled();
      expect(mockSocket.emit).toHaveBeenCalledWith(
        "chat-message",
        expect.objectContaining({
          roomId: mockReportId,
        })
      );
    });
  });

  it("should not send empty messages", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(
      <ChatPanel
        reportId={mockReportId}
        currentUserRole={mockCurrentUserRole}
        currentUserId={mockCurrentUserId}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText("Loading messages...")).not.toBeInTheDocument();
    });

    const buttons = screen.getAllByRole("button");
    const sendButton = buttons[buttons.length - 1]; // Last button is send button
    fireEvent.click(sendButton);

    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("should handle send on Enter key", async () => {
    (sendMessage as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        id: "3",
        content: "Enter message",
        createdAt: new Date().toISOString(),
      },
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(
      <ChatPanel
        reportId={mockReportId}
        currentUserRole={mockCurrentUserRole}
        currentUserId={mockCurrentUserId}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText("Loading messages...")).not.toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(textarea, { target: { value: "Enter message" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalled();
    });
  });

  it("should not send on Shift+Enter", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(
      <ChatPanel
        reportId={mockReportId}
        currentUserRole={mockCurrentUserRole}
        currentUserId={mockCurrentUserId}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText("Loading messages...")).not.toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(textarea, { target: { value: "Shift enter message" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });

    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("should display message count", async () => {
    const mockMessages = [
      {
        id: "1",
        content: "Message 1",
        author: { id: 1, username: "john_doe", firstName: "John", lastName: "Doe", role: "CITIZEN" },
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        content: "Message 2",
        author: { id: 2, username: "jane_smith", firstName: "Jane", lastName: "Smith", role: "TECHNICAL_OFFICER" },
        createdAt: new Date().toISOString(),
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockMessages,
    });

    render(
      <ChatPanel
        reportId={mockReportId}
        currentUserRole={mockCurrentUserRole}
        currentUserId={mockCurrentUserId}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("2 messages")).toBeInTheDocument();
    });
  });

  it("should handle fetch error gracefully", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    render(
      <ChatPanel
        reportId={mockReportId}
        currentUserRole={mockCurrentUserRole}
        currentUserId={mockCurrentUserId}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("0 messages")).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it("should cleanup socket connection on unmount", async () => {
    const { unmount } = render(
      <ChatPanel
        reportId={mockReportId}
        currentUserRole={mockCurrentUserRole}
        currentUserId={mockCurrentUserId}
      />
    );

    await waitFor(() => {
      expect(io).toHaveBeenCalled();
    });

    unmount();

    expect(mockSocket.off).toHaveBeenCalledWith("chat-message");
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });

  it("should display different sender roles correctly", async () => {
    const mockMessages = [
      {
        id: "1",
        content: "Citizen message",
        author: { id: 1, username: "john_doe", firstName: "John", lastName: "Doe", role: "CITIZEN" },
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        content: "Officer message",
        author: { id: 2, username: "jane_smith", firstName: "Jane", lastName: "Smith", role: "TECHNICAL_OFFICER" },
        createdAt: new Date().toISOString(),
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockMessages,
    });

    render(
      <ChatPanel
        reportId={mockReportId}
        currentUserRole={mockCurrentUserRole}
        currentUserId={mockCurrentUserId}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Citizen message")).toBeInTheDocument();
      expect(screen.getByText("Officer message")).toBeInTheDocument();
    });
  });

  it("should disable send button while sending", async () => {
    let resolveSendMessage: (value: any) => void;
    const sendMessagePromise = new Promise((resolve) => {
      resolveSendMessage = resolve;
    });

    (sendMessage as jest.Mock).mockReturnValue(sendMessagePromise);

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(
      <ChatPanel
        reportId={mockReportId}
        currentUserRole={mockCurrentUserRole}
        currentUserId={mockCurrentUserId}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText("Loading messages...")).not.toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText("Type a message...");
    const buttons = screen.getAllByRole("button");
    const sendButton = buttons[buttons.length - 1]; // Last button is send button

    fireEvent.change(textarea, { target: { value: "Test message" } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(sendButton).toBeDisabled();
    });

    resolveSendMessage!({
      success: true,
      data: { id: "1", content: "Test message", createdAt: new Date().toISOString() },
    });
  });
});
