import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import {
  fetchLists,
  addList,
  addItemToList,
  deleteList,
  deleteItemFromList,
  toggleItemCompleted,
} from "./api";
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

import "./App.css";

function App() {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [newItems, setNewItems] = useState({});
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for user in localStorage
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
        loadLists();
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const loadLists = async () => {
    try {
      const data = await fetchLists();
      const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setLists(sorted);
    } catch (err) {
      console.error('Error loading lists:', err);
      if (err.response?.status === 401) {
        // Token expired or invalid
        handleLogout();
      }
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    loadLists();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setLists([]);
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
      console.error(err);
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/dashboard" 
          element={
            user ? (
              <Dashboard
                handleLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/login" 
          element={
            user ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login onLogin={handleLogin} />
            )
          } 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/dashboard" /> : <Register />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
