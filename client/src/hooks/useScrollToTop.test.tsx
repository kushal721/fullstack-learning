import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Link, MemoryRouter, Route, Routes, useParams } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { useScrollToTop } from "./useScrollToTop.ts";

function Page() {
  const { slug = "" } = useParams();
  useScrollToTop(slug);
  return (
    <>
      <h1>{slug}</h1>
      <Link to="/b">Go to b</Link>
    </>
  );
}

describe("useScrollToTop", () => {
  it("scrolls up on every change, even when scrollTo returns a Promise", async () => {
    // Current Chrome returns a Promise from scrollTo(); returning it from the
    // effect made React call it as a cleanup and blank the page (#309).
    const scrollTo = vi
      .spyOn(window, "scrollTo")
      .mockImplementation((() => Promise.resolve()) as () => void);
    render(
      <MemoryRouter initialEntries={["/a"]}>
        <Routes>
          <Route path="/:slug" element={<Page />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(scrollTo).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole("link", { name: "Go to b" }));
    expect(screen.getByRole("heading", { name: "b" })).toBeInTheDocument();
    expect(scrollTo).toHaveBeenCalledTimes(2);
    expect(scrollTo).toHaveBeenLastCalledWith(0, 0);
  });
});
