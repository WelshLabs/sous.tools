import { AnswerView } from "@soustools/domain-inventory";

export const dynamic = "force-dynamic";

export default async function AnswerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; reviewId?: string }>;
}) {
  const resolvedParams = await searchParams;

  return (
    <div className="w-full min-h-screen pt-16 px-4 md:px-8">
      <AnswerView
        initialQuery={resolvedParams?.q}
        initialReviewId={resolvedParams?.reviewId}
      />
    </div>
  );
}
