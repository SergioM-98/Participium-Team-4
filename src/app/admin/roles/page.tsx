"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import RoleAssignmentSection from "@/components/pt03/RoleAssignmentSection";
import { retrieveMunicipalityUsers } from "@/app/lib/actions/municipalityUser";
import { MunicipalityUser } from "@/dtos/municipalityUser.dto";

export default function RolesManagementPage() {
  const [users, setUsers] = useState<MunicipalityUser[] | undefined>();
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [filteredUsers, setFilteredUsers] = useState<MunicipalityUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const response = await retrieveMunicipalityUsers();

      console.log(response);

      if (!response.success) {
        setLoading(false);
        return;
      }

      if (response.success && response.data) {
        setUsers(response.data);
      }
      setLoading(false);
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!users) return;

    const query = searchQuery.toLowerCase().trim();
    const filtered = users.filter((user) =>
      Object.values(user).some((value) =>
        String(value).toLowerCase().includes(query)
      )
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleRoleChange = async (userId: string, role: string) => {
    setUsers((prevUsers) =>
      prevUsers?.map((user) =>
        user.id === userId ? { ...user, role: role } : user
      )
    );
    setSuccessMessage("Role updated successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter">
              Role Management
            </h1>
            <p className="text-muted-foreground">
              Assign roles to municipality users
            </p>
          </div>

          {successMessage && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative text-sm"
              role="alert"
            >
              <span className="block sm:inline">✓ {successMessage}</span>
            </div>
          )}

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search users by name, email, role, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <RoleAssignmentSection
            users={filteredUsers}
            onRoleChange={handleRoleChange}
          />
        </div>
      </motion.div>
    </div>
  );
}
