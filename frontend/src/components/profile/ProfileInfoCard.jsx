function ProfileInfoCard({ profile }) {
  return (
    <div className="bg-white border rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <InfoItem label="Employee ID" value={profile.employeeId} />
      <InfoItem label="Email" value={profile.email} />
      <InfoItem label="Phone" value={profile.phone || "-"} />
      <InfoItem label="Department" value={profile.department} />
      <InfoItem label="Designation" value={profile.designation} />
      <InfoItem label="Joining Date" value={profile.joiningDate} />
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

export default ProfileInfoCard;
