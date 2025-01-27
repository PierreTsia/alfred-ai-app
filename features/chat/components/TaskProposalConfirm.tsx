import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TaskProposal } from "@/core/types";
import { useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";

export function TaskProposalConfirm({
  proposal,
  onConfirm,
}: {
  proposal: TaskProposal;
  onConfirm: () => void;
}) {
  const { user } = useUser();
  const addTask = useMutation(api.tasks.add);
  const t = useTranslations("TaskProposal");

  const handleConfirm = async () => {
    if (!user?.id) return;

    await addTask({
      text: proposal.text,
      description: proposal.description,
      priority: proposal.priority || "medium",
      isCompleted: false,
      userId: user.id,
      dueDate: proposal.dueDate
        ? new Date(proposal.dueDate).getTime()
        : undefined,
    });

    onConfirm();
  };

  return (
    <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <h4 className="font-medium">{t("title")}</h4>
      <p className="mt-1">{proposal.text}</p>
      {proposal.description && (
        <p className="text-gray-600 mt-1 text-sm">{proposal.description}</p>
      )}
      <div className="mt-3 flex gap-2">
        <Button
          onClick={handleConfirm}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {t("confirm")}
        </Button>
      </div>
    </div>
  );
}
