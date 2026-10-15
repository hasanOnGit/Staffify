import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { getProfile, updateProfile } from "../services/profile";

import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileInfoCard from "../components/profile/ProfileInfoCard";
import ProfileForm from "../components/profile/ProfileForm";

function Profile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    try {
      if (!user?.userId) {
        setError("User not available");
        setLoading(false);
        return;
      }

      setLoading(true);
      const data = await getProfile(user.userId);
      setProfile(data);
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleSave = async (updatedData) => {
    try {
      await updateProfile(user.userId, updatedData);
      setEditMode(false);
      fetchProfile();
    } catch {
      alert("Failed to update profile");
    }
  };

  return (
    <DashboardLayout>
      {loading && (
        <p className="text-gray-500">Loading profile...</p>
      )}

      {error && (
        <p className="text-red-600">{error}</p>
      )}

      {/* 🔥 Only render when profile exists */}
      {!loading && profile && (
        <>
          <ProfileHeader
            profile={profile}
            editMode={editMode}
            onEdit={() => setEditMode(true)}
            onCancel={() => setEditMode(false)}
          />

          {!editMode ? (
            <ProfileInfoCard profile={profile} />
          ) : (
            <ProfileForm
              profile={profile}
              onSave={handleSave}
            />
          )}
        </>
      )}
    </DashboardLayout>
  );
}

export default Profile;
