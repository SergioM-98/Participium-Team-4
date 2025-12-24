import { Context } from "grammy";
import { handleContact } from "../../handlers/contact";

describe("Contact Handler", () => {
  let mockCtx: Partial<Context>;

  beforeEach(() => {
    mockCtx = {
      reply: jest.fn(),
    };
  });

  it("should reply with contact information", async () => {
    await handleContact(mockCtx as Context);

    expect(mockCtx.reply).toHaveBeenCalledWith(
      expect.stringContaining("Contact Information"),
      expect.objectContaining({
        parse_mode: "HTML",
      }),
    );
  });
});
