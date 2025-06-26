import { useState, useEffect } from "react";
import apiClient from "../../contexts/apiClient";

const EditProjectModal = ({ project, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "planning",
    priority: "medium",
    is_active: true,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        start_date: project.start_date || "",
        end_date: project.end_date || "",
        status: project.status || "planning",
        priority: project.priority || "medium",
        is_active: project.is_active ?? true,
      });
    }
  }, [project]);

  const validateForm = () => {
    const newErrors = {};
    const today = new Date().toISOString().split("T")[0];

    if (!formData.name.trim()) {
      newErrors.name = ["Project name is required."];
    }

    if (formData.description && formData.description.trim().length < 10) {
      newErrors.description = ["Description must be at least 10 characters."];
    }

    if (formData.start_date && formData.start_date < today) {
      newErrors.start_date = ["Start date cannot be in the past."];
    }

    if (formData.start_date && formData.end_date && formData.end_date < formData.start_date) {
      newErrors.end_date = ["End date cannot be before start date."];
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setErrors({ ...errors, [name]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    if (!project?.id) {
      setErrors({ general: "Invalid project ID." });
      setIsSubmitting(false);
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        is_active: Boolean(formData.is_active),
      };

      const res = await apiClient.patch(`/api/projects/${project.id}/`, payload);
      alert("Project updated successfully!");
      if (onUpdate) onUpdate(res.data);
      onClose();
    } catch (error) {
      const response = error?.response?.data;
      console.error("Update failed:", error); // ✅ Useful for debugging
      setErrors(response || { general: "Something went wrong." });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4">
        <h2 className="text-xl font-semibold mb-4">Edit Project</h2>

        {errors.general && <div className="mb-4 text-red-600 text-sm">{errors.general}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Project Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg border-gray-300"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg border-gray-300"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg border-gray-300"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg border-gray-300"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg border-gray-300"
              >
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="mr-2"
            />
            <label className="text-sm text-gray-700">Active Project</label>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;