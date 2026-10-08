import type { TopicTreeNode } from "@fsl/shared";

/** A small learning tree for tests (not the real content). */
export const topicTreeFixture: TopicTreeNode = {
  id: "root",
  slug: "root",
  order: 0,
  title: "Full-Stack Development",
  summary: "Everything needed to build a web application.",
  children: [
    {
      id: "html",
      slug: "html",
      order: 1,
      title: "HTML",
      summary: "The structure of a web page.",
      children: [],
    },
    {
      id: "react",
      slug: "react",
      order: 2,
      title: "React",
      summary: "Components that update when data changes.",
      children: [
        {
          id: "hooks",
          slug: "hooks",
          order: 1,
          title: "Hooks",
          summary: "Remembering values between renders.",
          children: [],
        },
      ],
    },
  ],
};
