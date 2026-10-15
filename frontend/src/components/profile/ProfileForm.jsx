import { useState } from "react";

function ProfileForm({ profile, onSave }) {
  const [formData, setFormData] = useState({
    phone: profile.phone || "",
    address: profile.address || "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white border rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">
        Edit Personal Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 text-sm"
        />

        <input
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={() => onSave(formData)}
          className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default ProfileForm;
