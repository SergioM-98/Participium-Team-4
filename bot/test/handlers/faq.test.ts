import { Context } from "grammy";
import { handleFaq } from "../../handlers/faq";

describe("FAQ Handler", () => {
  let mockCtx: Partial<Context>;

  beforeEach(() => {
    mockCtx = {
      reply: jest.fn(),
    };
  });

  it("should reply with FAQ text", async () => {
    await handleFaq(mockCtx as Context);

    expect(mockCtx.reply).toHaveBeenCalledWith(
      expect.stringContaining("Frequently Asked Questions"),
      expect.objectContaining({
        parse_mode: "HTML",
      }),
    );
  });
});
