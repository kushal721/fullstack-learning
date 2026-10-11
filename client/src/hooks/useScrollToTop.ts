import { useEffect } from "react";

/**
 * Scrolls to the top whenever `key` changes, so following a link to another
 * topic, concept or step starts at the top of the new page.
 */
export function useScrollToTop(key: string) {
  useEffect(() => {
    // A block body on purpose: browsers now return a Promise from
    // scrollTo(), and an effect must return nothing or a cleanup function.
    window.scrollTo(0, 0);
  }, [key]);
}
