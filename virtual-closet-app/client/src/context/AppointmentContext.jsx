import { createContext, useContext, useState } from "react";

const AppointmentContext = createContext();

export function AppointmentProvider({ children }) {
  const [requestedItems, setRequestedItems] = useState([]);

  const addItem = (item) => {
    // Avoid duplicates based on item id (handle both _id and id)
    setRequestedItems((prev) => {
      const itemId = item._id || item.id || item.clothingId;
      const exists = prev.some((i) => {
        const existingId = i._id || i.id || i.clothingId;
        return existingId === itemId;
      });
      if (exists) return prev;
      return [...prev, item];
    });
  };

  const removeItem = (id) => {
    setRequestedItems((prev) => prev.filter((item) => {
      const itemId = item._id || item.id || item.clothingId;
      return itemId !== id;
    }));
  };

  const clearItems = () => {
    setRequestedItems([]);
  };

  return (
    <AppointmentContext.Provider
      value={{ requestedItems, addItem, removeItem, clearItems }}
    >
      {children}
    </AppointmentContext.Provider>
  );
}

export function useAppointment() {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error("useAppointment must be used within AppointmentProvider");
  }
  return context;
}