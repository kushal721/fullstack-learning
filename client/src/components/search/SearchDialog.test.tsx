import type { SearchResponse } from "@fsl/shared";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { clearApiCache } from "../../hooks/useApi.ts";
import { SearchLauncher } from "./SearchLauncher.tsx";

// jsdom has <dialog> but not showModal/close; give it the basics.
beforeAll(() => {
  const proto = HTMLDialogElement.prototype;
  if (!proto.showModal) {
    proto.showModal = function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
  }
  if (!proto.close || !("open" in proto)) {
    proto.close = function (this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  }
});

const results: SearchResponse = {
  query: "useState",
  groups: [
    {
      type: "concept",
      label: "Concepts",
      total: 1,
      results: [
        {
          type: "concept",
          id: "react-usestate",
          title: "useState",
          text: "Remembers a value.",
          href: "/concepts/react-usestate",
        },
      ],
    },
    {
      type: "file",
      label: "Files",
      total: 14,
      results: [
        {
          type: "file",
          id: "frontend/src/components/NoteForm.jsx",
          title: "frontend/src/components/NoteForm.jsx",
          text: "The form for a new note.",
          href: "/explorer?file=frontend%2Fsrc%2Fcomponents%2FNoteForm.jsx",
        },
        {
          type: "file",
          id: "frontend/src/App.jsx",
          title: "frontend/src/App.jsx",
          text: "The top component.",
          href: "/explorer?file=frontend%2Fsrc%2FApp.jsx",
        },
      ],
    },
  ],
};

function Location() {
  const location = useLocation();
  return (
    <output data-testid="location">
      {location.pathname + location.search}
    </output>
  );
}

function renderLauncher() {
  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockImplementation(async (input) => {
      const q = new URL(String(input), "http://x").searchParams.get("q");
      const body = q === "useState" ? results : { query: q, groups: [] };
      return new Response(JSON.stringify(body), { status: 200 });
    });
  render(
    <MemoryRouter>
      <input aria-label="Some other field" />
      <SearchLauncher />
      <Location />
    </MemoryRouter>,
  );
  return { fetchMock };
}

const dialog = () => document.querySelector("dialog")!;
const isOpen = () => dialog().hasAttribute("open");
const input = () =>
  screen.getByRole("combobox", { name: "Search the platform", hidden: true });
const status = () => within(dialog()).getByRole("status", { hidden: true });

describe("search dialog", () => {
  beforeEach(() => clearApiCache());

  it("opens from the header button and focuses the search box", async () => {
    renderLauncher();
    expect(isOpen()).toBe(false);
    await userEvent.click(screen.getByRole("button", { name: /Search/ }));
    expect(isOpen()).toBe(true);
    expect(input()).toHaveFocus();
    expect(status()).toHaveTextContent("Search concepts, files, code");
  });

  it("opens with / and Ctrl+K, but / typed in a field stays in the field", async () => {
    renderLauncher();
    await userEvent.click(
      screen.getByRole("textbox", { name: "Some other field" }),
    );
    await userEvent.keyboard("/");
    expect(isOpen()).toBe(false);
    expect(
      screen.getByRole("textbox", { name: "Some other field" }),
    ).toHaveValue("/");

    act(() => (document.activeElement as HTMLElement).blur());
    await userEvent.keyboard("/");
    expect(isOpen()).toBe(true);

    await userEvent.click(screen.getByRole("button", { name: /close search/ }));
    expect(isOpen()).toBe(false);
    await userEvent.keyboard("{Control>}k{/Control}");
    expect(isOpen()).toBe(true);
  });

  it("waits for 2 characters, then shows grouped results it can move through with the keyboard", async () => {
    const { fetchMock } = renderLauncher();
    await userEvent.click(screen.getByRole("button", { name: /Search/ }));
    await userEvent.type(input(), "u");
    expect(status()).toHaveTextContent("Type at least 2 characters.");
    await userEvent.type(input(), "seState");

    await waitFor(() =>
      expect(status()).toHaveTextContent(
        "15 results for “useState”. Use the arrow keys to choose, Enter to open.",
      ),
    );
    // Debounced: one request for the finished word, none per keystroke.
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "/api/search?q=useState",
    ]);

    const listbox = screen.getByRole("listbox", {
      name: "Search results",
      hidden: true,
    });
    expect(
      within(listbox)
        .getAllByRole("group", { hidden: true })
        .map(
          (g) => g.getAttribute("aria-labelledby") && g.firstChild?.textContent,
        ),
    ).toEqual(["Concepts", "Files (top 2 of 14)"]);
    const options = within(listbox).getAllByRole("option", { hidden: true });
    expect(input()).toHaveAttribute("aria-expanded", "true");
    expect(input()).toHaveAttribute("aria-activedescendant", options[0]!.id);
    expect(options[0]).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    expect(input()).toHaveAttribute("aria-activedescendant", options[1]!.id);
    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    expect(input()).toHaveAttribute("aria-activedescendant", options[2]!.id);
    await userEvent.keyboard("{Home}");
    expect(input()).toHaveAttribute("aria-activedescendant", options[0]!.id);
    await userEvent.keyboard("{End}{Enter}");

    expect(screen.getByTestId("location")).toHaveTextContent(
      "/explorer?file=frontend%2Fsrc%2FApp.jsx",
    );
    expect(isOpen()).toBe(false);
  });

  it("says when nothing matches and opens a result with the mouse", async () => {
    renderLauncher();
    await userEvent.click(screen.getByRole("button", { name: /Search/ }));
    await userEvent.type(input(), "xylophone");
    await waitFor(() =>
      expect(status()).toHaveTextContent("No results for “xylophone”."),
    );
    expect(input()).toHaveAttribute("aria-expanded", "false");

    await userEvent.clear(input());
    await userEvent.type(input(), "useState");
    await userEvent.click(
      await screen.findByRole("option", {
        name: /Remembers a value/,
        hidden: true,
      }),
    );
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/concepts/react-usestate",
    );
  });

  it("stays usable after opening and closing with Esc again and again", async () => {
    renderLauncher();
    // The browser turns Esc into a "cancel" event on the open dialog.
    const pressEsc = () =>
      act(() => {
        dialog().dispatchEvent(new Event("cancel", { cancelable: true }));
      });
    for (const open of ["/", "{Control>}k{/Control}", "/", "{Meta>}k{/Meta}"]) {
      await userEvent.keyboard(open);
      expect(isOpen()).toBe(true);
      expect(input()).toHaveFocus();
      pressEsc();
      expect(isOpen()).toBe(false);
      // Focus never stays in the hidden search box.
      expect(input()).not.toHaveFocus();
    }
  });

  it("closes with one Esc even with text typed, and keeps Tab inside", async () => {
    renderLauncher();
    const button = screen.getByRole("button", { name: /Search/ });
    await userEvent.click(button);
    await userEvent.type(input(), "use");
    const close = screen.getByRole("button", {
      name: /close search/,
      hidden: true,
    });
    await userEvent.tab();
    expect(close).toHaveFocus();
    await userEvent.tab();
    expect(input()).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(close).toHaveFocus();

    await userEvent.click(input());
    await userEvent.keyboard("{Escape}");
    expect(isOpen()).toBe(false);
    expect(button).toHaveFocus();
    // The query is still there next time.
    await userEvent.click(button);
    expect(input()).toHaveValue("use");
  });

  it("gives focus back to the button when closed", async () => {
    renderLauncher();
    const button = screen.getByRole("button", { name: /Search/ });
    await userEvent.click(button);
    await userEvent.click(
      screen.getByRole("button", { name: /close search/, hidden: true }),
    );
    expect(isOpen()).toBe(false);
    expect(button).toHaveFocus();
  });
});
