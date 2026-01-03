import { Context } from "grammy";
import { handleHelp } from "../../handlers/help";
import { helpMenu } from "../../menus/helpMenu";

jest.mock("../../menus/helpMenu", () => ({
  helpMenu: { mock: "helpMenu" },
}));

describe("Story 14 - Bot Integration: Quick Assistance and Help Commands", () => {
  let mockCtx: Partial<Context>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCtx = {
      reply: jest.fn(),
    };
  });

  it("should display help menu with available commands", async () => {
    await handleHelp(mockCtx as Context);

    expect(mockCtx.reply).toHaveBeenCalledTimes(1);
    const call = (mockCtx.reply as jest.Mock).mock.calls[0];
    const helpText = call[0];

    expect(helpText).toContain("Available Commands");
    expect(helpText).toContain("/start");
    expect(helpText).toContain("/report");
    expect(helpText).toContain("/myreports");
    expect(helpText).toContain("/faq");
    expect(helpText).toContain("/contact");
    expect(helpText).toContain("/help");
  });

  it("should format help text with HTML markup for bold text", async () => {
    await handleHelp(mockCtx as Context);

    const call = (mockCtx.reply as jest.Mock).mock.calls[0];
    const helpText = call[0];

    expect(helpText).toContain("<b>");
    expect(helpText).toContain("</b>");
    expect(helpText).toContain("<b>/start</b>");
    expect(helpText).toContain("<b>/report</b>");
  });

  it("should include command descriptions in help menu", async () => {
    await handleHelp(mockCtx as Context);

    const call = (mockCtx.reply as jest.Mock).mock.calls[0];
    const helpText = call[0];

    expect(helpText).toContain("Link your Telegram account");
    expect(helpText).toContain("Create a new report");
    expect(helpText).toContain("View all your submitted reports");
    expect(helpText).toContain("Read frequently asked questions");
    expect(helpText).toContain("Get contact information");
  });

  it("should use HTML parse mode for proper formatting", async () => {
    await handleHelp(mockCtx as Context);

    const call = (mockCtx.reply as jest.Mock).mock.calls[0];
    const options = call[1];

    expect(options.parse_mode).toBe("HTML");
  });

  it("should attach help menu keyboard to response", async () => {
    await handleHelp(mockCtx as Context);

    const call = (mockCtx.reply as jest.Mock).mock.calls[0];
    const options = call[1];

    expect(options.reply_markup).toBeDefined();
    expect(options.reply_markup.mock).toBe("helpMenu");
  });

  it("should include pagination info for myreports command", async () => {
    await handleHelp(mockCtx as Context);

    const call = (mockCtx.reply as jest.Mock).mock.calls[0];
    const helpText = call[0];

    expect(helpText).toContain("pagination");
    expect(helpText).toContain("5 per page");
  });

  it("should provide navigation instructions for users", async () => {
    await handleHelp(mockCtx as Context);

    const call = (mockCtx.reply as jest.Mock).mock.calls[0];
    const helpText = call[0];

    expect(helpText).toContain("Use the buttons below");
  });

  it("should reply with help text and help menu", async () => {
    await handleHelp(mockCtx as Context);

    expect(mockCtx.reply).toHaveBeenCalledWith(
      expect.stringContaining("Available Commands"),
      expect.objectContaining({
        parse_mode: "HTML",
        reply_markup: helpMenu,
      }),
    );
  });
});
