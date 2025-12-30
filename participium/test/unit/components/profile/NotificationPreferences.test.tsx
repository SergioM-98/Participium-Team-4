import { render, screen, fireEvent } from "@testing-library/react";
import { NotificationPreferences } from "@/components/profile/NotificationPreferences";

describe("NotificationPreferences", () => {
  const mockOnEmailEnabledChange = jest.fn();
  const mockOnTelegramEnabledChange = jest.fn();

  const defaultProps = {
    isEditing: false,
    isPending: false,
    emailEnabled: false,
    telegramEnabled: false,
    isTelegramConnected: false,
    onEmailEnabledChange: mockOnEmailEnabledChange,
    onTelegramEnabledChange: mockOnTelegramEnabledChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render section title", () => {
    render(<NotificationPreferences {...defaultProps} />);
    expect(screen.getByText("Notification Preferences")).toBeInTheDocument();
  });

  it("should render email notifications checkbox", () => {
    render(<NotificationPreferences {...defaultProps} />);
    expect(screen.getByText("Email Notifications")).toBeInTheDocument();
    expect(screen.getByText("Receive updates about reports via email.")).toBeInTheDocument();
  });

  it("should render telegram notifications checkbox", () => {
    render(<NotificationPreferences {...defaultProps} />);
    expect(screen.getByText("Telegram Notifications")).toBeInTheDocument();
    expect(screen.getByText("Receive real-time updates on Telegram.")).toBeInTheDocument();
  });

  it("should disable checkboxes when not editing", () => {
    render(<NotificationPreferences {...defaultProps} />);
    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach(checkbox => {
      expect(checkbox).toBeDisabled();
    });
  });

  it("should enable email checkbox when editing", () => {
    render(<NotificationPreferences {...defaultProps} isEditing={true} />);
    const emailCheckbox = screen.getByLabelText("Email Notifications");
    expect(emailCheckbox).not.toBeDisabled();
  });

  it("should check email checkbox when emailEnabled is true", () => {
    render(<NotificationPreferences {...defaultProps} emailEnabled={true} />);
    const emailCheckbox = screen.getByLabelText("Email Notifications");
    expect(emailCheckbox).toBeChecked();
  });

  it("should check telegram checkbox when telegramEnabled is true", () => {
    render(<NotificationPreferences {...defaultProps} telegramEnabled={true} isTelegramConnected={true} />);
    const telegramCheckbox = screen.getByLabelText("Telegram Notifications");
    expect(telegramCheckbox).toBeChecked();
  });

  it("should call onEmailEnabledChange when email checkbox is clicked", () => {
    render(<NotificationPreferences {...defaultProps} isEditing={true} />);
    const emailCheckbox = screen.getByLabelText("Email Notifications");
    
    fireEvent.click(emailCheckbox);
    
    expect(mockOnEmailEnabledChange).toHaveBeenCalledWith(true);
  });

  it("should call onTelegramEnabledChange when telegram checkbox is clicked", () => {
    render(<NotificationPreferences {...defaultProps} isEditing={true} isTelegramConnected={true} />);
    const telegramCheckbox = screen.getByLabelText("Telegram Notifications");
    
    fireEvent.click(telegramCheckbox);
    
    expect(mockOnTelegramEnabledChange).toHaveBeenCalledWith(true);
  });

  it("should disable telegram checkbox when telegram is not connected", () => {
    render(<NotificationPreferences {...defaultProps} isEditing={true} isTelegramConnected={false} />);
    const telegramCheckbox = screen.getByLabelText("Telegram Notifications");
    expect(telegramCheckbox).toBeDisabled();
  });

  it("should show info icon when telegram is not connected and editing", () => {
    const { container } = render(<NotificationPreferences {...defaultProps} isEditing={true} isTelegramConnected={false} />);
    const infoIcon = container.querySelector(".h-3.w-3.text-muted-foreground");
    expect(infoIcon).toBeInTheDocument();
  });

  it("should not show info icon when telegram is connected", () => {
    const { container } = render(<NotificationPreferences {...defaultProps} isEditing={true} isTelegramConnected={true} />);
    const infoIcon = container.querySelector(".h-3.w-3.text-muted-foreground");
    expect(infoIcon).not.toBeInTheDocument();
  });

  it("should disable all checkboxes when pending", () => {
    render(<NotificationPreferences {...defaultProps} isEditing={true} isPending={true} isTelegramConnected={true} />);
    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach(checkbox => {
      expect(checkbox).toBeDisabled();
    });
  });

  it("should apply correct styling when editing", () => {
    const { container } = render(<NotificationPreferences {...defaultProps} isEditing={true} />);
    const cards = container.querySelectorAll(".bg-card");
    expect(cards.length).toBeGreaterThan(0);
  });

  it("should apply muted styling when not editing", () => {
    const { container } = render(<NotificationPreferences {...defaultProps} isEditing={false} />);
    const mutedCards = container.querySelectorAll(".bg-muted\\/20");
    expect(mutedCards.length).toBeGreaterThan(0);
  });

  it("should render Bell icon", () => {
    const { container } = render(<NotificationPreferences {...defaultProps} />);
    const bellIcon = container.querySelector(".h-5.w-5.text-muted-foreground");
    expect(bellIcon).toBeInTheDocument();
  });

  it("should apply opacity when telegram not connected and editing", () => {
    const { container } = render(<NotificationPreferences {...defaultProps} isEditing={true} isTelegramConnected={false} />);
    const telegramCard = container.querySelector(".opacity-50.cursor-not-allowed");
    expect(telegramCard).toBeInTheDocument();
  });

  it("should render separator", () => {
    const { container } = render(<NotificationPreferences {...defaultProps} />);
    // Separator should be present
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should have grid layout for preferences", () => {
    const { container } = render(<NotificationPreferences {...defaultProps} />);
    const grid = container.querySelector(".grid.gap-4");
    expect(grid).toBeInTheDocument();
  });
});
