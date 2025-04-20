import React, { useEffect, useState } from "react";
import {
  fetchLists,
  addList,
  addItemToList,
  deleteList,
  deleteItemFromList,
  toggleItemCompleted,
} from "../api"; // Adjusted import path
import "../App.css";
import { useNavigate } from "react-router-dom";

const Dashboard = ({ handleLogout: parentHandleLogout }) => {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [newItems, setNewItems] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      loadLists();
    }
  }, []);

  const loadLists = async () => {
    try {
      const data = await fetchLists();
      const sorted = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setLists(sorted);
    } catch (err) {
      console.error("Failed to fetch lists:", err);
      if (err.response?.status === 401) {
        // Token expired or invalid
        handleLogout();
      }
    }
  };

  const handleAddList = async () => {
    if (!newListName.trim()) return;
    try {
      await addList(newListName);
      setNewListName("");
      loadLists();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItem = async (listId) => {
    if (!newItems[listId]?.trim()) return;
    try {
      await addItemToList(listId, newItems[listId]);
      setNewItems((prev) => ({ ...prev, [listId]: "" }));
      loadLists();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteList = async (listId) => {
    try {
      await deleteList(listId);
      loadLists();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (listId, itemId) => {
    try {
      await deleteItemFromList(listId, itemId);
      loadLists();
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  const handleToggleItem = async (listId, itemId) => {
    try {
      await toggleItemCompleted(listId, itemId);
      loadLists();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    if (parentHandleLogout) {
      parentHandleLogout();
    }
    navigate("/login");
  };

  return (
    <div className="App">
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
      <div className="header">
        <h1>🛒 CartMate</h1>
      </div>

      <div className="add-list">
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="New list name"
        />
        <button onClick={handleAddList}>Add List</button>
      </div>

      {lists.map((list) => (
        <div className="list" key={list._id}>
          <div className="list-header">
            <h2>{list.name}</h2>
            <p className="date">
              Created on: {new Date(list.createdAt).toLocaleString()}
            </p>
            <button onClick={() => handleDeleteList(list._id)}>🗑️</button>
          </div>

          <div className="items">
            {list.items.map((item) => (
              <div key={item._id} className="item">
                <span
                  className={item.completed ? "completed" : ""}
                  onClick={() => handleToggleItem(list._id, item._id)}
                >
                  {item.name}
                </span>
                <button onClick={() => handleDeleteItem(list._id, item._id)}>
                  ❌
                </button>
              </div>
            ))}
          </div>

          <div className="add-item">
            <input
              type="text"
              value={newItems[list._id] || ""}
              onChange={(e) =>
                setNewItems((prev) => ({
                  ...prev,
                  [list._id]: e.target.value,
                }))
              }
              placeholder="New item"
            />
            <button onClick={() => handleAddItem(list._id)}>Add Item</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
