import { AssignmentSubmissionsClient } from "./submissions-client";

type PageProps = {
  params: Promise<{
    assignmentId: string;
  }>;
};

export default async function AssignmentSubmissionsPage({ params }: PageProps) {
  const { assignmentId } = await params;

  return (
    <div className="space-y-6 p-6">
      <AssignmentSubmissionsClient assignmentId={Number(assignmentId)} />
    </div>
  );
}
