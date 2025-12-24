import { Context } from "grammy";
import { handleHelp } from "../../handlers/help";
import { helpMenu } from "../../menus/helpMenu";

describe("Help Handler", () => {
  let mockCtx: Partial<Context>;

  beforeEach(() => {
    mockCtx = {
      reply: jest.fn(),
    };
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
