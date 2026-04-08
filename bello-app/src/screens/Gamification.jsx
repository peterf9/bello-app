import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const GARDEN_ITEMS = [
  { id: 'house', name: 'Dog House', icon: 'home', price: 150, category: 'furniture' },
  { id: 'pool', name: 'Pet Pool', icon: 'pool', price: 300, category: 'fun' },
  { id: 'tree', name: 'Oak Tree', icon: 'park', price: 100, category: 'nature' },
  { id: 'ball', name: 'Golden Ball', icon: 'sports_baseball', price: 50, category: 'toy' },
];

export default function Gamification({ appState, updateState }) {
  const { t } = useTranslation();
  const { petInfo, gamification = {} } = appState;
  const { xp = 0, level = 1, patacoins = 100, unlockedItems = [], dailyTasks = {} } = gamification;

  const [activeTab, setActiveTab] = useState('garden'); // 'garden' or 'shop'

  const nextLevelXp = level * 200;
  const progress = (xp % 200) / 200 * 100;

  const handleCompleteTask = (task) => {
    if (dailyTasks[task]) return;

    updateState(prev => {
      const rewardXp = task === 'walk' ? 50 : 15;
      const rewardCoins = task === 'walk' ? 20 : 5;
      
      const newXp = (prev.gamification?.xp || 0) + rewardXp;
      const newLevel = Math.floor(newXp / 200) + 1;

      return {
        ...prev,
        gamification: {
          ...prev.gamification,
          xp: newXp,
          level: newLevel,
          patacoins: (prev.gamification?.patacoins || 0) + rewardCoins,
          dailyTasks: {
            ...prev.gamification?.dailyTasks,
            [task]: true
          }
        }
      };
    });
  };

  const buyItem = (item) => {
    if (patacoins < item.price || unlockedItems.includes(item.id)) return;

    updateState(prev => ({
      ...prev,
      gamification: {
        ...prev.gamification,
        patacoins: prev.gamification.patacoins - item.price,
        unlockedItems: [...prev.gamification.unlockedItems, item.id]
      }
    }));
  };

  return (
    <div className="min-h-screen bg-surface pb-32">
      {/* Premium Header */}
      <header className="relative h-48 bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-tertiary opacity-90"></div>
        
        {/* Abstract Deco */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-20 -left-10 w-32 h-32 bg-secondary/20 rounded-full blur-2xl"></div>

        <div className="relative z-10 px-6 pt-10 flex flex-col h-full">
           <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="font-headline text-3xl font-bold text-on-primary">{t("gamificationHero")}</h1>
                <p className="text-on-primary/70 text-sm font-medium">{t("petLevel")} {level}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/30 shadow-lg">
                <span className="material-symbols-outlined text-yellow-400" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
                <span className="font-bold text-on-primary text-xl">{patacoins}</span>
              </div>
           </div>

           {/* XP Progress Bar */}
           <div className="mt-auto mb-6">
              <div className="flex justify-between text-[10px] uppercase tracking-widest text-on-primary/60 font-bold mb-1.5 px-1">
                <span>XP {xp % 200} / 200</span>
                <span>Level {level + 1}</span>
              </div>
              <div className="h-2.5 w-full bg-black/20 rounded-full overflow-hidden p-0.5 backdrop-blur-sm">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full shadow-[0_0_10px_rgba(253,211,77,0.5)]"
                />
              </div>
           </div>
        </div>
      </header>

      {/* Navigation Switcher */}
      <div className="flex px-6 -mt-6 relative z-20 gap-3">
         <button 
           onClick={() => setActiveTab('garden')}
           className={`flex-1 py-3 rounded-xl font-bold text-sm shadow-lg transition-all ${
             activeTab === 'garden' ? "bg-white text-primary" : "bg-white/60 backdrop-blur-md text-primary/50"
           }`}
         >
           {t("navAdventure")}
         </button>
         <button 
           onClick={() => setActiveTab('shop')}
           className={`flex-1 py-3 rounded-xl font-bold text-sm shadow-lg transition-all ${
             activeTab === 'shop' ? "bg-white text-primary" : "bg-white/60 backdrop-blur-md text-primary/50"
           }`}
         >
           {t("shopTitle")}
         </button>
      </div>

      <main className="px-6 mt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'garden' ? (
            <motion.section 
              key="garden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Garden Visualizer */}
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img 
                  src="/images/garden_bg.png" 
                  alt="Garden" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Decoration Layers */}
                {GARDEN_ITEMS.map((item) => unlockedItems.includes(item.id) && (
                  <motion.div
                    key={item.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute z-20"
                    style={getPlacement(item.id)}
                  >
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant drop-shadow-md">
                      {item.icon}
                    </span>
                  </motion.div>
                ))}

                {/* Pet Avatar */}
                <motion.div 
                  animate={{ 
                    y: [0, -10, 0],
                  }}
                  transition={{ 
                    duration: 2.5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30"
                >
                  <div className="w-20 h-20 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white/20 backdrop-blur-sm">
                    {petInfo.photoUrl ? (
                      <img src={petInfo.photoUrl} alt={petInfo.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/20">
                         <span className="material-symbols-outlined text-4xl text-primary">pets</span>
                      </div>
                    )}
                  </div>
                </motion.div>
                
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* Day's Adventure Card */}
              <div className="bg-surface-container-low rounded-2xl p-6 shadow-sm border border-outline-variant">
                <h3 className="font-headline text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">verified</span>
                  {t("dailyGoals")}
                </h3>
                
                <div className="space-y-4">
                  <TaskRow 
                    icon="directions_walk" 
                    title={t("walkGoal")} 
                    xp="+50 XP" 
                    coins="+20"
                    completed={dailyTasks.walk}
                    onComplete={() => handleCompleteTask('walk')}
                  />
                  <TaskRow 
                    icon="water_drop" 
                    title={t("waterGoal")} 
                    xp="+15 XP" 
                    coins="+5"
                    completed={dailyTasks.water}
                    onComplete={() => handleCompleteTask('water')}
                  />
                </div>
              </div>
            </motion.section>
          ) : (
            <motion.section 
              key="shop"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 gap-4 pb-10"
            >
              {GARDEN_ITEMS.map((item) => (
                <div 
                  key={item.id}
                  className={`bg-white rounded-2xl p-4 flex flex-col items-center text-center shadow-sm border transition-all ${
                    unlockedItems.includes(item.id) ? "border-primary/20 opacity-60" : "border-outline-variant active:scale-95"
                  }`}
                  onClick={() => buyItem(item)}
                >
                  <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-3xl text-primary">{item.icon}</span>
                  </div>
                  <p className="font-bold text-sm text-on-surface">{item.name}</p>
                  
                  {unlockedItems.includes(item.id) ? (
                    <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      {t("unlocked")}
                    </span>
                  ) : (
                    <div className="mt-2 flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
                       <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
                       <span className="font-bold text-primary text-xs">{item.price}</span>
                    </div>
                  )}
                </div>
              ))}
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function TaskRow({ icon, title, xp, coins, completed, onComplete }) {
  return (
    <div 
      className={`flex items-center justify-between p-4 rounded-xl transition-all ${
        completed ? "bg-primary/5 opacity-60" : "bg-white shadow-sm hover:shadow-md cursor-pointer"
      }`}
      onClick={!completed ? onComplete : undefined}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          completed ? "bg-primary text-white" : "bg-surface-container"
        }`}>
          <span className="material-symbols-outlined">{completed ? 'check' : icon}</span>
        </div>
        <div>
           <p className="font-bold text-sm text-on-surface">{title}</p>
           <div className="flex gap-2">
             <span className="text-[10px] font-bold text-primary">{xp}</span>
             <span className="text-[10px] font-bold text-yellow-600 flex items-center">
               <span className="material-symbols-outlined text-[10px] mr-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
               {coins}
             </span>
           </div>
        </div>
      </div>
      {!completed && (
        <span className="material-symbols-outlined text-primary/30">chevron_right</span>
      )}
    </div>
  );
}

function getPlacement(id) {
  switch(id) {
    case 'house': return { top: '20%', right: '15%' };
    case 'pool': return { bottom: '15%', left: '10%' };
    case 'tree': return { bottom: '40%', right: '20%' };
    case 'ball': return { bottom: '25%', right: '40%' };
    default: return { top: '0', left: '0' };
  }
}
