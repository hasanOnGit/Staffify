function ProfileHeader({ profile, editMode, onEdit, onCancel }) {
  if (!profile) return null;

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {profile.name || "User"}
        </h1>
        <p className="text-sm text-gray-500">
          {profile.designation || "-"} · {profile.department || "-"}
        </p>
      </div>

      {!editMode ? (
        <button
          onClick={onEdit}
          className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm"
        >
          Edit Profile
        </button>
      ) : (
        <button
          onClick={onCancel}
          className="border px-4 py-2 rounded-md text-sm"
        >
          Cancel
        </button>
      )}
    </div>
  );
}

export default ProfileHeader;
