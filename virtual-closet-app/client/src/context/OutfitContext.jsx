import { createContext, useContext, useState } from "react";

const OutfitContext = createContext();

export function OutfitProvider({children}){

    const [availableItems, setAvailableItems] = useState({});

    const [selectedItems, setSelectedItems] = useState({});

    const addToOutfit = (category, item) => {
        setAvailableItems((prev) => {
            const updated = {...prev};
            if(!updated[category]) updated[category] = [];
            // Prevent duplicated
            if(!updated[category].some((i) => i.id === item.id)){
                updated[category].push(item);
            }
            return updated;
        });
    };

    const selectOutfitItem = (category, item) =>{
        setSelectedItems((prev)=> ({...prev, [category]: item }));
    };

    const clearOutfit = () => setSelectedItems({});

    return (
        <OutfitContext.Provider
        value={{
            availableItems,
            selectedItems,
            addToOutfit,
            selectOutfitItem,
            clearOutfit,
        }}
        >
            {children}
        </OutfitContext.Provider>
    );
}

export function useOutfit(){
    return useContext(OutfitContext);
}


