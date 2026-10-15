import type { TopicTreeResponse } from "@fsl/shared";
import { LearningTree } from "../components/learning-tree/LearningTree.tsx";
import { ErrorState } from "../components/ui/ErrorState.tsx";
import { Loading } from "../components/ui/Loading.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";
import { useApi } from "../hooks/useApi.ts";
import { apiPaths } from "../services/api.ts";
import { PageMeta } from "../components/ui/PageMeta.tsx";

export default function LearnPage() {
  const { data, error, isLoading, reload } = useApi<TopicTreeResponse>(
    apiPaths.topicTree(),
  );

  return (
    <>
      <PageMeta
        title="Learn"
        description="The learning tree: every topic of full-stack development in order, from how the web works to deployment."
      />
      <PageHeader
        title="Learn"
        description={
          data?.tree.summary ??
          "The learning tree: a map of everything you need to understand full-stack development."
        }
      />
      {isLoading && <Loading label="Loading the learning tree…" />}
      {error && <ErrorState message={error.message} onRetry={reload} />}
      {data && (
        <div className="max-w-3xl">
          <LearningTree root={data.tree} />
        </div>
      )}
    </>
  );
}
