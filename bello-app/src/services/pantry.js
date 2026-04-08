const LOCAL_STORAGE_KEY = "bello_app_state";

export const fetchAppState = async () => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      let parsed = JSON.parse(saved);

      // MIGRATION: Se tem petInfo na raiz, é o formato antigo (1 cachorro)
      if (parsed.petInfo) {
         parsed = {
           activePetId: "pet_1",
           settings: parsed.settings || { language: 'en' },
           pets: {
             "pet_1": {
                petInfo: parsed.petInfo,
                schedule: parsed.schedule,
                logs: parsed.logs || {}
             }
           }
         };
         localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
      }

      return parsed;
    }
    return getNewRootState();
  } catch (error) {
    console.error("Error fetching state:", error);
    return getNewRootState();
  }
};

export const updateAppState = async (newState) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
    return newState;
  } catch (error) {
    console.error("Error updating state:", error);
    return null;
  }
};

export const getNewRootState = () => ({
  activePetId: "pet_1",
  settings: { language: 'pt', aiApiKey: '' },
  pets: {
    "pet_1": getDefaultPetState("Luffy")
  }
});

export const getDefaultPetState = (name = "Novo Cão") => ({
  petInfo: {
    name,
    weight: 10,
    microchip: "",
    photoUrl: "",
    breed: "Generic",
    foodName: "",
    foodDailyBase: 300,
    adultWeight: 30,
    gender: "male",
    foodGrid: null,
    mealsCompletedThisMonth: 0,
  },
  schedule: {
    frequency: 3,
    meals: [
      { id: "meal_1", name: "Breakfast", time: "07:30", type: "morning" },
      { id: "meal_2", name: "Lunch", time: "13:00", type: "afternoon" },
      { id: "meal_3", name: "Dinner", time: "19:30", type: "evening" }
    ],
    notificationsEnabled: true
  },
  logs: {}
});
