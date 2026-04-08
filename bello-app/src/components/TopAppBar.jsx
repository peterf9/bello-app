import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function TopAppBar({ rootState, updateRootState, onCreatePet }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isSettings = location.pathname === "/settings";
  
  const activePetId = rootState?.activePetId;
  const activePet = rootState?.pets?.[activePetId] || {};
  const { petInfo } = activePet;
  const photoUrl = petInfo?.photoUrl || "/luffy.jpg";
  const petName = petInfo?.name || "Bello";

  const handleSwitchPet = (petId) => {
    updateRootState({ activePetId: petId });
    setIsDropdownOpen(false);
  };

  const handleAddPet = () => {
    const defaultName = prompt(t("newPetName") || "Nome do Novo Cão");
    if (defaultName && defaultName.trim().length > 0) {
      onCreatePet(defaultName.trim());
    }
    setIsDropdownOpen(false);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'pt' ? 'en' : 'pt';
    i18n.changeLanguage(newLang);
    updateRootState({
      settings: {
        ...rootState.settings,
        language: newLang
      }
    });
  };

  return (
    <header className="w-full top-0 sticky z-40 bg-[#f2ede6] dark:bg-stone-900 transition-colors">
      <div className="flex items-center justify-between px-6 py-4 w-full max-w-xl mx-auto relative">
        <div className="flex items-center gap-3">
          {isSettings ? (
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-[#f8f3ec]/50 transition-colors rounded-full active:scale-90 duration-200"
            >
              <span className="material-symbols-outlined text-[#914d00]">arrow_back</span>
            </button>
          ) : (
            <div 
               onClick={() => setIsDropdownOpen(!isDropdownOpen)}
               className={`w-10 h-10 rounded-full overflow-hidden cursor-pointer ${location.pathname === '/profile' ? 'border-2 border-primary-container' : 'bg-primary-container'}`}>
              <img
                alt={`${petName}'s profile`}
                className="w-full h-full object-cover"
                src={photoUrl}
              />
            </div>
          )}
          
          {isSettings ? (
            <h1 className="font-['Plus_Jakarta_Sans'] text-xl font-bold tracking-tight text-[#914d00] dark:text-[#ffaf6d]">
              {t("dietSettings")}
            </h1>
          ) : (
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 cursor-pointer select-none"
            >
              <h1 className="font-['Plus_Jakarta_Sans'] text-xl font-bold tracking-tight text-[#914d00] dark:text-[#ffaf6d]">
                {petName}
              </h1>
              <span className="material-symbols-outlined text-[#914d00] dark:text-[#ffaf6d] text-lg transition-transform duration-200" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                expand_more
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Language Switch */}
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 hover:bg-white dark:hover:bg-stone-800 transition-all active:scale-95 group"
            title={i18n.language === 'pt' ? 'Switch to English' : 'Mudar para Português'}
          >
            <span className={`text-[10px] font-bold transition-colors ${i18n.language === 'pt' ? 'text-orange-600' : 'text-stone-400'}`}>PT</span>
            <div className="w-6 h-3.5 bg-stone-200 dark:bg-stone-700 rounded-full relative flex items-center px-0.5">
              <div className={`w-2.5 h-2.5 bg-orange-500 rounded-full transition-all duration-300 ${i18n.language === 'en' ? 'translate-x-2.5' : 'translate-x-0'}`}></div>
            </div>
            <span className={`text-[10px] font-bold transition-colors ${i18n.language === 'en' ? 'text-orange-600' : 'text-stone-400'}`}>EN</span>
          </button>

          {isSettings ? (
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary-container">
              <img
                alt="Pet Profile"
                className="w-full h-auto object-cover"
                src={photoUrl}
              />
            </div>
          ) : (
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#f8f3ec]/50 transition-colors active:scale-90 duration-200">
              <span className="material-symbols-outlined text-[#914d00] dark:text-[#ffaf6d]">notifications</span>
            </button>
          )}
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && !isSettings && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm" 
              onClick={() => setIsDropdownOpen(false)}
            ></div>
            <div className="absolute top-16 left-6 z-50 w-56 bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 overflow-hidden transform transition-all">
              <div className="p-2 space-y-1">
                {Object.keys(rootState?.pets || {}).map((petId) => {
                  const p = rootState.pets[petId];
                  const isActive = petId === activePetId;
                  return (
                    <button
                      key={petId}
                      onClick={() => handleSwitchPet(petId)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isActive ? 'bg-[#fff8ea] dark:bg-stone-700/50' : 'hover:bg-stone-50 dark:hover:bg-stone-700/30'}`}
                    >
                      <img src={p.petInfo.photoUrl || "/luffy.jpg"} alt={p.petInfo.name} className="w-8 h-8 rounded-full object-cover bg-stone-200" />
                      <span className={`font-semibold text-sm ${isActive ? 'text-[#914d00] dark:text-[#ffaf6d]' : 'text-stone-700 dark:text-stone-300'}`}>
                        {p.petInfo.name}
                      </span>
                      {isActive && <span className="material-symbols-outlined ml-auto text-[#914d00] text-sm">check</span>}
                    </button>
                  );
                })}
                <div className="h-px w-full bg-stone-100 dark:bg-stone-700 my-1"></div>
                <button
                  onClick={handleAddPet}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[#914d00] dark:text-[#ffaf6d] hover:bg-orange-50 dark:hover:bg-stone-700/50 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">add_circle</span>
                  <span className="font-semibold text-sm text-[12px]">{t("addApet")}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

