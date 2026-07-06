"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import deleteProperty from "@/app/actions/deleteProperty";

const DeletePropertyButton = ({ propertyId }) => {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this property?",
    );
    if (!confirmed) return;

    const deletePropertyById = deleteProperty.bind(null, propertyId);

    try {
      await deletePropertyById();
      toast.success("Property Deleted");
      router.push("/properties");
      router.refresh();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err?.message || "Failed to delete property");
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-red-500 hover:bg-red-600 text-white font-bold w-full py-2 px-4 rounded-full flex items-center justify-center"
      type="button"
    >
      Delete
    </button>
  );
};

export default DeletePropertyButton;
