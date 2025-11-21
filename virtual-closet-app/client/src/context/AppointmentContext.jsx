import { createContext, useContext, useState } from "react";

const AppointmentContext = createContext();

export function AppointmentProvider({ children }) {
  const [requestedItems, setRequestedItems] = useState([]);

  const addItem = (item) => {
    // Avoid duplicates based on item id
    setRequestedItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      if (exists) return prev;
      return [...prev, item];
    });
  };

  const removeItem = (id) => {
    setRequestedItems((prev) => prev.filter((item) => item.id !== id));
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