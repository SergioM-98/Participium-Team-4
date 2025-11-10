"use client";

import { FC } from "react";
import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-xl p-8"
    >
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter text-black">
          Municipality Users
        </h1>
        <p className="text-muted-foreground  text-black">
          Create internal municipality accounts.
        </p>
      </div>

      {error && (
        <div 
          className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-sm"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="mt-6">
        <MunicipalityUserForm
          onSubmit={onSubmit}
          initialData={initialData}
          submitLabel={submitLabel}
          onCancel={onCancel}
        />
      </div>
    </motion.div>
  );
};

export default UserFormSection;
