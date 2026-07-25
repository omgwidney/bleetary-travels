import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HostQuiz from "@/components/HostQuiz";
import { saveHostLead } from "@/lib/firebase";

vi.mock("@/lib/firebase", () => ({
  saveHostLead: vi.fn(),
}));

describe("HostQuiz", () => {
  beforeEach(() => {
    vi.mocked(saveHostLead).mockResolvedValue(undefined);
  });

  it("moves through the qualification steps and saves the lead", async () => {
    const user = userEvent.setup();
    render(<HostQuiz />);

    await user.click(screen.getByRole("button", { name: "👥 Yes" }));
    await user.click(
      screen.getByRole("button", {
        name: /Building toward earning/,
      }),
    );
    await user.click(screen.getByRole("button", { name: "Next →" }));

    await user.type(screen.getByLabelText("Your name"), "Alex Host");
    await user.type(screen.getByLabelText("Email address"), "alex@example.com");
    await user.click(
      screen.getByRole("button", { name: "Get My Hosting Guide →" }),
    );

    expect(saveHostLead).toHaveBeenCalledWith({
      name: "Alex Host",
      email: "alex@example.com",
      hasCommunity: "yes",
      communityStage: "building",
      source: "host_quiz",
    });
    expect(
      await screen.findByRole("heading", { name: "You're on the list! 🚀" }),
    ).toBeInTheDocument();
  });

  it("supports returning to the previous step", async () => {
    const user = userEvent.setup();
    render(<HostQuiz />);

    await user.click(screen.getByRole("button", { name: "🤔 Not yet" }));
    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(
      screen.getByRole("heading", {
        name: "Do you lead a community that might travel together?",
      }),
    ).toBeInTheDocument();
  });
});
