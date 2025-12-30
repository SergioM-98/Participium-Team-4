import { render, screen, fireEvent } from "@testing-library/react";
import { TelegramSection } from "@/components/profile/TelegramSection";

describe("TelegramSection", () => {
  const mockOnConnectTelegram = jest.fn();
  const mockOnRemoveTelegramChange = jest.fn();

  const defaultProps = {
    isTelegramConnected: false,
    isEditing: false,
    isPending: false,
    telegramStatus: "idle" as const,
    removeTelegram: false,
    onConnectTelegram: mockOnConnectTelegram,
    onRemoveTelegramChange: mockOnRemoveTelegramChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("when Telegram is not connected", () => {
    it("should render Connect with Telegram button", () => {
      render(<TelegramSection {...defaultProps} />);
      expect(screen.getByText("Connect with Telegram")).toBeInTheDocument();
    });

    it("should show informational text", () => {
      render(<TelegramSection {...defaultProps} />);
      expect(screen.getByText(/Click to be redirected to Telegram/)).toBeInTheDocument();
    });

    it("should call onConnectTelegram when button is clicked", () => {
      render(<TelegramSection {...defaultProps} />);
      const button = screen.getByText("Connect with Telegram");
      
      fireEvent.click(button);
      
      expect(mockOnConnectTelegram).toHaveBeenCalled();
    });

    it("should show opening state", () => {
      render(<TelegramSection {...defaultProps} telegramStatus="opening" />);
      expect(screen.getByText("Opening Telegram...")).toBeInTheDocument();
    });

    it("should show opened state", () => {
      render(<TelegramSection {...defaultProps} telegramStatus="opened" />);
      expect(screen.getByText("Telegram Opened")).toBeInTheDocument();
    });

    it("should show success message when telegram is opened", () => {
      render(<TelegramSection {...defaultProps} telegramStatus="opened" />);
      expect(screen.getByText(/Telegram opened in new window/)).toBeInTheDocument();
    });

    it("should disable button when pending", () => {
      render(<TelegramSection {...defaultProps} isPending={true} />);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should disable button when opening", () => {
      render(<TelegramSection {...defaultProps} telegramStatus="opening" />);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });

  describe("when Telegram is connected", () => {
    const connectedProps = {
      ...defaultProps,
      isTelegramConnected: true,
    };

    it("should show 'Telegram Connected' message", () => {
      render(<TelegramSection {...connectedProps} />);
      expect(screen.getByText("Telegram Connected")).toBeInTheDocument();
    });

    it("should render CheckCircle icon", () => {
      const { container } = render(<TelegramSection {...connectedProps} />);
      const icon = container.querySelector(".text-green-600");
      expect(icon).toBeInTheDocument();
    });

    it("should not show disconnect option when not editing", () => {
      render(<TelegramSection {...connectedProps} isEditing={false} />);
      expect(screen.queryByText("Disconnect Telegram Account")).not.toBeInTheDocument();
    });

    it("should show disconnect option when editing", () => {
      render(<TelegramSection {...connectedProps} isEditing={true} />);
      expect(screen.getByText("Disconnect Telegram Account")).toBeInTheDocument();
    });

    it("should render disconnect checkbox when editing", () => {
      render(<TelegramSection {...connectedProps} isEditing={true} />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
    });

    it("should call onRemoveTelegramChange when checkbox is toggled", () => {
      render(<TelegramSection {...connectedProps} isEditing={true} />);
      const checkbox = screen.getByRole("checkbox");
      
      fireEvent.click(checkbox);
      
      expect(mockOnRemoveTelegramChange).toHaveBeenCalledWith(true);
    });

    it("should check checkbox when removeTelegram is true", () => {
      render(<TelegramSection {...connectedProps} isEditing={true} removeTelegram={true} />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });

    it("should disable checkbox when pending", () => {
      render(<TelegramSection {...connectedProps} isEditing={true} isPending={true} />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeDisabled();
    });

    it("should show warning text about disconnecting", () => {
      render(<TelegramSection {...connectedProps} isEditing={true} />);
      expect(screen.getByText(/Check this box to remove your Telegram connection/)).toBeInTheDocument();
    });

    it("should have red styling for disconnect section", () => {
      const { container } = render(<TelegramSection {...connectedProps} isEditing={true} />);
      const disconnectSection = container.querySelector(".border-red-200");
      expect(disconnectSection).toBeInTheDocument();
    });
  });

  describe("button content states", () => {
    it("should show Send icon in idle state", () => {
      const { container } = render(<TelegramSection {...defaultProps} telegramStatus="idle" />);
      const icons = container.querySelectorAll("svg");
      expect(icons.length).toBeGreaterThan(0);
    });

    it("should show Loader icon in opening state", () => {
      const { container } = render(<TelegramSection {...defaultProps} telegramStatus="opening" />);
      const loader = container.querySelector(".animate-spin");
      expect(loader).toBeInTheDocument();
    });

    it("should show Link icon in opened state", () => {
      render(<TelegramSection {...defaultProps} telegramStatus="opened" />);
      const { container } = render(<TelegramSection {...defaultProps} telegramStatus="opened" />);
      const icons = container.querySelectorAll("svg");
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  it("should have proper button styling", () => {
    const { container } = render(<TelegramSection {...defaultProps} />);
    const button = container.querySelector(".bg-\\[\\#0088cc\\]");
    expect(button).toBeInTheDocument();
  });
});
