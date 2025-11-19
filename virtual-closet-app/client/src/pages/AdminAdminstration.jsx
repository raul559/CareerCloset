import { useEffect, useState } from "react";
import { useAdmin } from "../contexts/AdminContext";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { admin, logout, getAuthHeader } = useAdmin();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [clothing, setClothing] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    if (!admin) navigate("/admin/login");
    loadData();
  }, [admin]);

  const loadData = async () => {
    try {
      const statRes = await fetch("http://localhost:5000/api/admin/dashboard/stats", {
        headers: getAuthHeader(),
      });
      const clothingRes = await fetch("http://localhost:5000/api/admin/dashboard/clothing", {
        headers: getAuthHeader(),
      });

      setStats(await statRes.json());
      setClothing(await clothingRes.json());
    } catch (err) {
      console.error("Failed to load admin data", err);
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    await fetch(`http://localhost:5000/api/admin/dashboard/clothing/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });
    setClothing(clothing.filter((i) => i._id !== id));
  };

  const saveEdit = async () => {
    const res = await fetch(
      `http://localhost:5000/api/admin/dashboard/clothing/${editing._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(editing),
      }
    );

    const updated = await res.json();
    setClothing(clothing.map((c) => (c._id === updated._id ? updated : c)));
    setEditing(null);
  };

  if (!admin) return null;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white shadow rounded">
          <p className="text-gray-600">Total Items</p>
          <p className="text-2xl font-bold">{stats?.totalItems}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <p className="text-gray-600">Total Users</p>
          <p className="text-2xl font-bold">{stats?.totalUsers}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <p className="text-gray-600">Categories</p>
          <p className="text-2xl font-bold">{stats?.itemsByCategory?.length}</p>
        </div>
      </div>

      {/* Clothing Table */}
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Size</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clothing.map((item) => (
              <tr key={item._id} className="border-b">
                <td className="p-3">
                  <img src={item.imageUrl} className="h-16 w-16 rounded object-cover" />
                </td>
                <td className="p-3">{item.name}</td>
                <td className="p-3">{item.category}</td>
                <td className="p-3">{item.size}</td>
                <td className="p-3">
                  <button
                    className="text-blue-600 mr-3"
                    onClick={() => setEditing({ ...item })}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600"
                    onClick={() => deleteItem(item._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Item</h2>

            <label className="block mb-3">
              Name
              <input
                className="w-full border p-2 rounded"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </label>

            <label className="block mb-3">
              Category
              <input
                className="w-full border p-2 rounded"
                value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
              />
            </label>

            <label className="block mb-3">
              Size
              <input
                className="w-full border p-2 rounded"
                value={editing.size}
                onChange={(e) => setEditing({ ...editing, size: e.target.value })}
              />
            </label>

            <div className="flex gap-2 mt-4">
              <button onClick={saveEdit} className="bg-blue-600 text-white px-4 py-2 rounded">
                Save
              </button>
              <button
                onClick={() => setEditing(null)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
