"use client";

import React, { useState } from "react";

import { CreateAssignmentModal } from "@/components/assignments/create-assignment-modal";
import { TeacherAssignmentsList } from "@/components/assignments/teacher-assignments-list";

export default function TeacherAssignmentsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 p-6">
      <TeacherAssignmentsList
        onCreateClick={() => setModalOpen(true)}
        refreshTrigger={refreshTrigger}
      />

      <CreateAssignmentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
