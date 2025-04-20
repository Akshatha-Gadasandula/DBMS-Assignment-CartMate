const BASE_URL = "http://localhost:5000";

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Get all lists
export const fetchLists = async () => {
  const response = await fetch(`${BASE_URL}/lists`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to fetch lists");
  }
  return response.json();
};

// Add a new list
export const addList = async (name) => {
  const response = await fetch(`${BASE_URL}/lists`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name })
  });
  if (!response.ok) throw new Error("Failed to add list");
  return response.json();
};

// Add item to a list
export const addItemToList = async (listId, name) => {
  const response = await fetch(`${BASE_URL}/lists/${listId}/items`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name })
  });
  if (!response.ok) throw new Error("Failed to add item");
  return response.json();
};

// Delete list
export const deleteList = async (listId) => {
  const response = await fetch(`${BASE_URL}/lists/${listId}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error("Failed to delete list");
  return response.json();
};

// Delete item from list
export const deleteItemFromList = async (listId, itemId) => {
  const response = await fetch(`${BASE_URL}/lists/${listId}/items/${itemId}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error("Failed to delete item");
  return response.json();
};

// Toggle item completed
export const toggleItemCompleted = async (listId, itemId) => {
  const response = await fetch(`${BASE_URL}/lists/${listId}/items/${itemId}/toggle`, {
    method: "PATCH",
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error("Failed to toggle item");
  return response.json();
};
