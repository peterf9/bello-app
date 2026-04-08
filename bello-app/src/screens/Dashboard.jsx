import { t } from "../utils/translations";

export default function Dashboard({ appState, updateState, lang }) {
  const schedule = appState?.schedule || { meals: [] };
  const logs = appState?.logs || {};
  const today = new Date().toISOString().split("T")[0];
  const todayLogs = logs[today] || [];

  const handleToggleMeal = (mealId) => {
    updateState((prev) => {
      const logsForToday = prev.logs[today] || [];
      const logItem = logsForToday.find(log => (typeof log === 'string' ? log : log.id) === mealId);
      const isCompleting = !logItem;
      const newLogsForToday = isCompleting
        ? [...logsForToday, { id: mealId, completedAt: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]
        : logsForToday.filter((log) => (typeof log === 'string' ? log : log.id) !== mealId);
      
      let newScheduleMeals = prev.schedule.meals || [];

      // If completing a meal, dynamically recalculate future meals based on current time
      if (isCompleting && newScheduleMeals.length > 0) {
        const mealIndex = newScheduleMeals.findIndex(m => m.id === mealId);
        
        // Only recalculate if it's not the last meal
        if (mealIndex !== -1 && mealIndex < newScheduleMeals.length - 1) {
          const now = new Date();
          const freq = parseInt(prev.schedule.frequency || 3, 10);
          // Fixed digestion space: 4 hours for high frequency, 5 for standard
          const offsetHours = freq >= 4 ? 4 : 5;

          newScheduleMeals = newScheduleMeals.map((meal, idx) => {
            if (idx > mealIndex && !newLogsForToday.some(log => (typeof log === 'string' ? log : log.id) === meal.id)) {
              const hops = idx - mealIndex;
              const futureTime = new Date(now.getTime() + (hops * offsetHours * 60 * 60 * 1000));
              const hours = String(futureTime.getHours()).padStart(2, '0');
              const mins = String(futureTime.getMinutes()).padStart(2, '0');
              return { ...meal, time: `${hours}:${mins}` };
            }
            return meal;
          });
        }
      }
      
      return {
        ...prev,
        logs: {
          ...prev.logs,
          [today]: newLogsForToday
        },
        schedule: {
          ...prev.schedule,
          meals: newScheduleMeals
        }
      };
    });
  };

  const nextMeal = schedule.meals?.find((meal) => !todayLogs.some(log => (typeof log === 'string' ? log : log.id) === meal.id)) || schedule.meals?.[0];

  return (
    <main className="max-w-xl mx-auto px-6 pt-8 pb-32 space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary-container p-8 text-on-primary shadow-lg shadow-primary/10">
        <div className="relative z-10">
          <p className="font-label text-xs uppercase tracking-[0.2em] opacity-80 mb-2">{t("dailyProgress", lang)}</p>
          <h2 className="font-headline text-4xl font-extrabold tracking-tight mb-1">
            {todayLogs.length === schedule.meals?.length ? t("allDone", lang) : `${t("nextMealAt", lang)} ${nextMeal?.time || '--:--'}`}
          </h2>
          <p className="text-sm opacity-90">{todayLogs.length === schedule.meals?.length ? t("restWell", lang) : `${schedule.gramsPerMeal || '---'}g ${t("perMeal", lang).toLowerCase()}`}</p>
        </div>
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute right-6 top-6">
           <span className="material-symbols-outlined text-6xl opacity-20" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
        </div>
      </section>

      {/* Meals Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="font-headline text-lg font-bold">{t("todaysMeals", lang)}</h3>
          <span className="font-label text-[11px] font-semibold uppercase text-on-surface-variant tracking-wider">{schedule.meals?.length || 0} {t("totalMeals", lang)}</span>
        </div>

        {schedule.meals?.map((meal) => {
          const logItem = todayLogs.find(log => (typeof log === 'string' ? log : log.id) === meal.id);
          const isCompleted = !!logItem;
          const completedAt = typeof logItem === 'object' ? logItem.completedAt : null;
          
          return (
            <div
              key={meal.id}
              onClick={() => handleToggleMeal(meal.id)}
              className={`cursor-pointer group relative rounded-lg p-5 flex items-center justify-between border-l-4 transition-all ${
                isCompleted
                  ? "bg-surface-container-low border-secondary hover:bg-surface-container"
                  : "bg-surface-container-highest border-tertiary"
              }`}
            >
              <div className="flex items-center gap-5">
                <div className="flex flex-col">
                   <span className="font-label text-[11px] font-bold uppercase text-on-surface-variant tracking-widest">
                     {meal.time}
                     {completedAt && <span className="text-secondary ml-2 normal-case font-medium">✓ {completedAt}</span>}
                   </span>
                   <span className="font-headline text-xl font-bold text-on-surface">{t(meal.name.replace(/\\s+/g, ''), lang) !== meal.name.replace(/\\s+/g, '') ? t(meal.name.replace(/\\s+/g, ''), lang) : t(meal.name, lang)}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  isCompleted ? "bg-secondary-container text-on-secondary-container" : "bg-tertiary-container text-on-tertiary-container"
                }`}>
                  {isCompleted ? t("completedText", lang) : t("pending", lang)}
                </div>
                {isCompleted ? (
                   <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-on-secondary shadow-sm">
                      <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                   </div>
                ) : (
                   <button className="w-12 h-12 rounded-full border-2 border-tertiary flex items-center justify-center text-tertiary bg-surface-container-lowest hover:bg-tertiary hover:text-on-tertiary active:scale-90 transition-all duration-200">
                      <span className="material-symbols-outlined text-2xl">radio_button_unchecked</span>
                   </button>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Stats Bento */}
      <div className="grid grid-cols-2 gap-4 pb-8">
        <div className="bg-surface-container p-6 rounded-lg flex flex-col justify-between aspect-square">
           <span className="material-symbols-outlined text-primary text-3xl">water_drop</span>
           <div>
              <h4 className="font-headline text-2xl font-extrabold text-on-surface">1.2L</h4>
              <p className="text-xs text-on-surface-variant font-medium">{t("waterIntake", lang)}</p>
           </div>
        </div>
        <div className="bg-secondary-container/30 p-6 rounded-lg flex flex-col justify-between aspect-square">
           <span className="material-symbols-outlined text-secondary text-3xl">exercise</span>
           <div>
              <h4 className="font-headline text-2xl font-extrabold text-on-surface">45m</h4>
              <p className="text-xs text-on-surface-variant font-medium">{t("activityTotal", lang)}</p>
           </div>
        </div>
      </div>
    </main>
  );
}
