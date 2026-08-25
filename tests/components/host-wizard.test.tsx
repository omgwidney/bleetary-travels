import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HostApplicationWizard from "@/components/host/HostApplicationWizard";

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("@/lib/firebase", () => ({
  auth: {
    currentUser: null,
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

const mockDestinations = [
  { id: "bali", name: "Bali", country: "Indonesia", region: "Southeast Asia" },
  { id: "vumba", name: "Vumba", country: "Zimbabwe", region: "Africa" },
];

describe("HostApplicationWizard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("renders step 1 and navigates to step 2 after valid input", async () => {
    const user = userEvent.setup();
    render(
      <HostApplicationWizard
        initialUser={{
          uid: "test-user-123",
          email: "host@example.com",
          displayName: "Host Test",
        }}
        availableDestinations={mockDestinations}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Tell us about your audience" }),
    ).toBeInTheDocument();

    const communityInput = screen.getByLabelText(/Community or Brand Name/i);
    await user.type(communityInput, "Nomad Creatives");

    const continueBtn = screen.getByRole("button", {
      name: /Continue to Audience & Reach/i,
    });
    await user.click(continueBtn);

    expect(
      await screen.findByRole("heading", {
        name: "Audience size & social handles",
      }),
    ).toBeInTheDocument();
  });

  it("blocks transition if required fields are missing in step 1", async () => {
    const user = userEvent.setup();
    render(
      <HostApplicationWizard
        initialUser={null}
        availableDestinations={mockDestinations}
      />,
    );

    const continueBtn = screen.getByRole("button", {
      name: /Continue to Audience & Reach/i,
    });
    await user.click(continueBtn);

    expect(
      screen.getByText(/Please enter your community or brand name/i),
    ).toBeInTheDocument();
  });
});
