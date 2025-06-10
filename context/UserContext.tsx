import React, { createContext, useContext, useState } from 'react';

type UserContextType = {
  coins: number;
  setCoins: (coins: number) => void;
  purchasedItems: string[];
  setPurchasedItems: (items: string[]) => void;
  equippedItem: string | null;
  setEquippedItem: (itemId: string | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [coins, setCoins] = useState(50);
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const [equippedItem, setEquippedItem] = useState<string | null>(null);

  return (
    <UserContext.Provider
      value={{
        coins,
        setCoins,
        purchasedItems,
        setPurchasedItems,
        equippedItem,
        setEquippedItem,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};