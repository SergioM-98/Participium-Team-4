"use client";

import { FC } from "react";
import MunicipalityUserForm, {
  MunicipalityUserFormData,
} from "@/components/MunicipalityUserForm";

type Props = {
  error?: string;
  initialData?: MunicipalityUserFormData;
  submitLabel?: string;
  onSubmit: (payload: MunicipalityUserFormData) => void;
  onCancel?: () => void;
};

const UserFormSection: FC<Props> = ({
  error,
  initialData,
  submitLabel = "Save user",
  onSubmit,
  onCancel,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">
        Municipality Users (PT02)
      </h1>
      <p className="text-sm text-gray-700">
        Create internal municipality accounts.
      </p>

      {error && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-4">
        <MunicipalityUserForm
          onSubmit={onSubmit}
          initialData={initialData}
          submitLabel={submitLabel}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
};

export default UserFormSection;
