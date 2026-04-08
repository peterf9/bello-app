import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import TopAppBar from "./components/TopAppBar";
import BottomNav from "./components/BottomNav";
import Dashboard from "./screens/Dashboard";
import History from "./screens/History";
import Profile from "./screens/Profile";
import Settings from "./screens/Settings";
import { fetchAppState, updateAppState, getDefaultPetState } from "./services/pantry";

function App() {
  const [rootState, setRootState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadState = async () => {
      const state = await fetchAppState();
      setRootState(state);
      setLoading(false);
    };
    loadState();
  }, []);

  const handleUpdateActivePetState = (updater) => {
    setRootState((prevRoot) => {
      const activeId = prevRoot.activePetId;
      const prevPetState = prevRoot.pets[activeId];
      const newPetState = typeof updater === "function" ? updater(prevPetState) : { ...prevPetState, ...updater };
      
      const newRoot = {
        ...prevRoot,
        pets: {
          ...prevRoot.pets,
          [activeId]: newPetState
        }
      };
      updateAppState(newRoot);
      return newRoot;
    });
  };

  const handleUpdateRootSettings = (updater) => {
    setRootState((prevRoot) => {
      const newRoot = typeof updater === "function" ? updater(prevRoot) : { ...prevRoot, ...updater };
      updateAppState(newRoot);
      return newRoot;
    });
  };

  const handleCreatePet = (name) => {
    const newPetId = `pet_${Date.now()}`;
    setRootState((prevRoot) => {
      const newRoot = {
        ...prevRoot,
        activePetId: newPetId,
        pets: {
          ...prevRoot.pets,
          [newPetId]: getDefaultPetState(name)
        }
      };
      updateAppState(newRoot);
      return newRoot;
    });
  };

  const handleDeletePet = (petIdToDelete) => {
    setRootState((prevRoot) => {
      const newPets = { ...prevRoot.pets };
      delete newPets[petIdToDelete];
      
      const remainingPetIds = Object.keys(newPets);
      if (remainingPetIds.length === 0) {
        // Fallback se apagar o último cachorro
        const fallbackId = `pet_${Date.now()}`;
        newPets[fallbackId] = getDefaultPetState("Bello");
        remainingPetIds.push(fallbackId);
      }
      
      const newActiveId = prevRoot.activePetId === petIdToDelete ? remainingPetIds[0] : prevRoot.activePetId;
      
      const newRoot = {
        ...prevRoot,
        pets: newPets,
        activePetId: newActiveId
      };
      updateAppState(newRoot);
      return newRoot;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent flex rounded-full animate-spin"></div>
      </div>
    );
  }

  const lang = rootState?.settings?.language || "en";
  const activePetInfo = rootState?.pets[rootState?.activePetId];

  return (
    <BrowserRouter>
      <TopAppBar 
        rootState={rootState} 
        updateRootState={handleUpdateRootSettings}
        onCreatePet={handleCreatePet}
        lang={lang} 
      />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard appState={activePetInfo} updateState={handleUpdateActivePetState} lang={lang} />} />
        <Route path="/history" element={<History appState={activePetInfo} lang={lang} />} />
        <Route path="/profile" element={<Profile rootState={rootState} appState={activePetInfo} updateState={handleUpdateActivePetState} onDeletePet={handleDeletePet} lang={lang} />} />
        <Route path="/settings" element={<Settings rootState={rootState} updateRootState={handleUpdateRootSettings} appState={activePetInfo} updateState={handleUpdateActivePetState} lang={lang} />} />
      </Routes>
      <BottomNav lang={lang} />
    </BrowserRouter>
  );
}

export default App;
