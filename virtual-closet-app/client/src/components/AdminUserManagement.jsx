import { useEffect, useState } from "react";
import {
  getAllUsers,
  promoteUser,
  demoteUser,
  deleteUser,
} from "../services/adminApi";

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);

  const load = () => {
    getAllUsers().then((res) => setUsers(res.data));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h2>User Management</h2>

      {users.map((u) => (
        <div key={u._id} style={styles.card}>
          <div>
            <strong>{u.name}</strong> — {u.email}
            <p>Role: {u.role}</p>
          </div>

          <div>
            <button style={styles.button} onClick={() => promoteUser(u._id).then(load)}>
              Promote
            </button>
            <button style={styles.button} onClick={() => demoteUser(u._id).then(load)}>
              Demote
            </button>
            <button
              style={styles.delete}
              onClick={() => deleteUser(u._id).then(load)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #ccc",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
  },
  button: {
    marginRight: "10px",
    padding: "6px 10px",
    cursor: "pointer",
  },
  delete: {
    background: "red",
    color: "white",
    padding: "6px 10px",
    cursor: "pointer",
  },
};
