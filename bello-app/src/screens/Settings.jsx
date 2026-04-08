import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Settings({ rootState, updateRootState, appState, updateState }) {
  const { t } = useTranslation();
  const schedule = appState?.schedule || { meals: [] };
  const petInfo = appState?.petInfo || {};
  const [localMeals, setLocalMeals] = useState(schedule.meals || []);
  const [frequency, setFrequency] = useState(schedule.frequency || 3);

  const handleTimeChange = (id, newTime) => {
    setLocalMeals(prev => prev.map(m => m.id === id ? { ...m, time: newTime } : m));
  };

  const handleFrequencyChange = (newFreq) => {
    setFrequency(newFreq);
    if (newFreq > localMeals.length) {
      const difference = newFreq - localMeals.length;
      const newMeals = [...localMeals];
      for (let i = 0; i < difference; i++) {
        newMeals.push({
          id: `meal_${Date.now()}_${i}`,
          name: t("extraMeal"),
          time: "16:00",
          type: "afternoon"
        });
      }
      setLocalMeals(newMeals);
    } else if (newFreq < localMeals.length) {
      setLocalMeals(localMeals.slice(0, newFreq));
    }
  };

  const handleSave = () => {
    updateState({
      schedule: {
        ...schedule,
        frequency,
        meals: localMeals
      }
    });
  };

  return (
    <main className="max-w-xl mx-auto px-6 pt-8 pb-48 space-y-10">
      {/* Hero Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="font-label text-on-surface-variant uppercase tracking-widest text-[11px] font-bold">{t("nutritionPlan")}</p>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">{t("mealScheduling")}</h1>
        <p className="text-sm font-medium text-on-surface-variant leading-relaxed">
          {t("adjustRoutine", { name: petInfo?.name || "Bello" })}
        </p>
      </section>

      {/* Frequency Toggle Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-on-surface">{t("dailyFrequency")}</h2>
          <span className="material-symbols-outlined text-tertiary">restaurant</span>
        </div>
        <div className="p-2 bg-surface-container rounded-2xl flex relative shadow-sm border border-outline-variant/20 hover:border-outline-variant transition-colors">
          <select 
            value={frequency} 
            onChange={(e) => handleFrequencyChange(Number(e.target.value))} 
            className="w-full bg-transparent font-bold text-lg text-primary outline-none appearance-none cursor-pointer pl-4 py-2 pr-8"
          >
            {[1, 2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>
                {num} {num === 1 ? t("perMeal").replace(' / ', '') : t("mealsPerDay") || "Refeições por dia"}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none">expand_more</span>
        </div>
      </section>

      {/* Meal Times Form */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-on-surface">{t("mealTimes")}</h2>
          <span className="text-xs font-bold text-primary px-3 py-1 bg-primary-container/20 rounded-full">Automated</span>
        </div>
        <div className="space-y-4">
          {localMeals.map((meal) => (
            <div key={meal.id} className="group relative flex flex-col gap-2 p-6 rounded-lg bg-surface-container-low border border-outline-variant/10 transition-all hover:bg-surface-container-lowest hover:shadow-xl hover:shadow-primary/5">
              <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 rounded-r-full ${
                meal.type === 'morning' ? 'bg-secondary-fixed' : meal.type === 'afternoon' ? 'bg-tertiary-fixed' : 'bg-primary-container'
              }`}></div>
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">
                  {meal.type === 'morning' ? 'wb_sunny' : meal.type === 'afternoon' ? 'light_mode' : 'dark_mode'}
                </span>
                {t(meal.name.replace(/\s+/g, '')) !== meal.name.replace(/\s+/g, '') ? t(meal.name.replace(/\s+/g, '')) : meal.name}
              </label>
              <div className="flex items-center justify-between">
                <input
                  className="bg-transparent border-none p-0 text-2xl font-bold text-on-surface focus:ring-0 w-full cursor-pointer"
                  type="time"
                  value={meal.time}
                  onChange={(e) => handleTimeChange(meal.id, e.target.value)}
                />
                <span className="material-symbols-outlined text-outline">edit</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Save Button */}
      <div className="fixed bottom-24 left-0 w-full px-6 flex justify-center pointer-events-none z-40">
        <div className="w-full max-w-xl pointer-events-auto">
          <button
            onClick={handleSave}
            className="w-full bg-primary text-on-primary py-5 rounded-full font-bold text-lg shadow-xl shadow-primary/20 active:scale-95 transition-transform duration-200 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">check_circle</span>
            {t("saveChanges")}
          </button>
        </div>
      </div>
    </main>
  );
}

