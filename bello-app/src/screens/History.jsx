import { useTranslation } from "react-i18next";

export default function History({ appState }) {
  const { t, i18n } = useTranslation();
  const logs = appState?.logs || {};
  const schedule = appState?.schedule || { meals: [] };
  
  const sortedDates = Object.keys(logs).sort((a, b) => new Date(b) - new Date(a));

  return (
    <main className="max-w-xl mx-auto px-6 pt-8 space-y-8 pb-32">
      {/* Header */}
      <section className="space-y-2">
        <p className="font-label text-on-surface-variant uppercase tracking-widest text-[11px] font-bold">{t("nutritionLogs")}</p>
        <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">{t("pastRecords")}</h2>
        <p className="font-body text-sm text-on-surface-variant leading-relaxed">
           {t("reviewConsistency")}
        </p>
      </section>

      {/* Timeline */}
      <section className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/20 before:via-outline-variant/30 before:to-transparent space-y-6">
        
        {sortedDates.map((dateStr, idx) => {
           const logItems = logs[dateStr] || [];
           const totalMeals = schedule.meals?.length || 0;
           const isComplete = logItems.length === totalMeals && totalMeals > 0;
           
           const dateObj = new Date(dateStr + "T12:00:00"); // Avoid timezone shifting
           const dayText = dateObj.toLocaleDateString(i18n.language === 'pt' ? 'pt-BR' : 'en-US', { weekday: "short", month: "short", day: "numeric" });
           
           return (
             <div key={dateStr} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
               
               <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface ${isComplete ? 'bg-primary' : 'bg-surface-container-high'} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
                 <span className={`material-symbols-outlined text-[18px] ${isComplete ? 'text-on-primary' : 'text-on-surface-variant'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                   {isComplete ? 'star' : 'schedule'}
                 </span>
               </div>
               
               <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-surface-container-low p-5 rounded-xl shadow-sm border border-outline-variant/20 hover:bg-surface-container transition-colors">
                 <div className="flex items-center justify-between mb-2">
                    <h4 className="font-headline font-bold text-on-surface text-lg capitalize">{dayText}</h4>
                    <div className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${isComplete ? 'bg-primary-container text-primary' : 'bg-secondary-container text-secondary'}`}>
                      {totalMeals > 0 ? Math.round((logItems.length / totalMeals) * 100) : 0}%
                    </div>
                 </div>
                 <p className="font-body text-sm font-medium text-on-surface-variant mb-4">{logItems.length} {t("of")} {totalMeals} {t("mealsCompleted")}.</p>
                 
                 <div className="w-full bg-surface-container-high rounded-full h-2.5 mb-2 overflow-hidden flex">
                    {schedule.meals?.map((m) => (
                      <div 
                         key={m.id}
                         className={`h-full flex-1 border-r border-surface/50 last:border-0 ${logItems.some(log => (typeof log === 'string' ? log : log.id) === m.id) ? 'bg-primary' : 'bg-surface-variant'}`}
                      ></div>
                    ))}
                 </div>
               </div>
             </div>
           );
        })}
        {sortedDates.length === 0 && (
          <div className="pl-14 text-on-surface-variant text-sm font-bold">No logs yet. Start feeding today!</div>
        )}
      </section>
    </main>
  );
}

