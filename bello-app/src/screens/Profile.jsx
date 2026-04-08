import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getCroppedImgBase64 } from "../utils/cropImage";
import breedData from "../utils/breeds.json";

export default function Profile({ rootState, appState, updateState, onDeletePet }) {
  const { t, i18n } = useTranslation();
  const petInfo = appState?.petInfo || {};
  const schedule = appState?.schedule || {};
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditInfoOpen, setIsEditInfoOpen] = useState(location.state?.openEdit || false);
  const [calcResult, setCalcResult] = useState(null);

  useEffect(() => {
    if (location.state?.openEdit) {
      setIsEditInfoOpen(true);
      // Clear state so it doesn't reopen on every navigation back
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
  // NFC State
  const [isScanningNfc, setIsScanningNfc] = useState(false);
  const [nfcError, setNfcError] = useState(null);

  // Cropper State
  const [tempPhotoUrl, setTempPhotoUrl] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [profileForm, setProfileForm] = useState({
    name: petInfo.name || "Bello",
    birthDate: petInfo.birthDate || "2020-10-14",
    photoUrl: petInfo.photoUrl || "/luffy.jpg",
    breed: petInfo.breed || "Generic",
    weight: petInfo.weight || "32.5",
    microchip: petInfo.microchip || "",
    foodName: petInfo.foodName || "",
    foodDailyBase: petInfo.foodDailyBase || "300",
    adultWeight: petInfo.adultWeight || "30",
    gender: petInfo.gender || "male",
    manualGrid: petInfo.manualGrid || [],
    adultWeeklyPercentages: petInfo.adultWeeklyPercentages || { 0: 50, 1: 50, 2: 50, 3: 50, 4: 50, 5: 50, 6: 50 }
  });

  const handleFormChange = (field, value) => {
    let newForm = { ...profileForm, [field]: value };
    
    if (field === 'breed' || field === 'gender') {
      const selected = breedData.find(b => b.breed === newForm.breed);
      if (selected) {
        if (newForm.gender === 'male' && selected.pesoMacho) {
          newForm.adultWeight = String(selected.pesoMacho);
        } else if (newForm.gender === 'female' && selected.pesoFemea) {
          newForm.adultWeight = String(selected.pesoFemea);
        }
      }
    }
    
    setProfileForm(newForm);
  };

  const selectedBreedData = breedData.find(b => b.breed === petInfo.breed) || { origin: "Desconhecido" };

  const getExactAge = (dateString) => {
    if (!dateString) return { months: 3, extraDays: 0 };
    const bDate = new Date(dateString);
    const today = new Date();
    
    let months = (today.getFullYear() - bDate.getFullYear()) * 12 + (today.getMonth() - bDate.getMonth());
    let extraDays = today.getDate() - bDate.getDate();

    if (extraDays < 0) {
      months--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      extraDays += prevMonth.getDate();
    }
    return { months, extraDays };
  };

  const handleProfilePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Instead of saving directly, open Cropper
      setTempPhotoUrl(reader.result);
      setZoom(1);
      setRotation(0);
      setCrop({ x: 0, y: 0 });
    };
    e.target.value = null; // reset input
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirmCrop = async () => {
    try {
      const croppedImageBase64 = await getCroppedImgBase64(
        tempPhotoUrl,
        croppedAreaPixels,
        rotation
      );
      setProfileForm({ ...profileForm, photoUrl: croppedImageBase64 });
      setTempPhotoUrl(null);
    } catch (e) {
      console.error(e);
    }
  };

  const calculateBirthdayInfo = (dateString) => {
    if (!dateString) return { formatted: "October 14th", daysLeft: 12 };
    const birthDate = new Date(dateString);
    const today = new Date();
    
    let nextBday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    
    if (today > nextBday) {
      nextBday.setFullYear(today.getFullYear() + 1);
    }
    
    const diffTime = Math.abs(nextBday - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const formatted = birthDate.toLocaleDateString(i18n.language === 'pt' ? 'pt-BR' : 'en-US', { month: 'long', day: 'numeric' });
    return { formatted, daysLeft: diffDays };
  };

  const bdayInfo = calculateBirthdayInfo(petInfo.birthDate);

  const calculateAgeStr = (dateString) => {
    const age = getExactAge(dateString);
    if (!dateString) return "Desconhecido";
    if (age.months <= 0) return "Recém-nascido";
    if (age.months < 12) return `${age.months} meses`;
    
    const years = Math.floor(age.months / 12);
    const remainingMonths = age.months % 12;
    return remainingMonths === 0 ? `${years} anos` : `${years} anos e ${remainingMonths} meses`;
  };

  const isAdult = getExactAge(petInfo.birthDate).months >= 12;

  const handleCalculateMath = () => {
    const freq = parseInt(schedule?.frequency || 3, 10);
    let base = parseInt(petInfo.foodDailyBase || profileForm.foodDailyBase || 300, 10);
    let calcDetails = `Base de ${base}g dividida em ${freq} refeições diárias.`;

    // Calculo manual de grade interativa (prioridade 1)
    const grid = petInfo.manualGrid || profileForm.manualGrid;
    if (grid && grid.length > 0) {
        const exactAge = getExactAge(petInfo.birthDate);
        const fractionalMonths = exactAge.months + (exactAge.extraDays / 30);
        
        const validGrid = grid.filter(g => g.month !== '' && g.grams !== '').map(g => ({ month: parseFloat(g.month), grams: parseFloat(g.grams) }));
        if (validGrid.length > 0) {
            validGrid.sort((a,b) => a.month - b.month);
            
            if (fractionalMonths <= validGrid[0].month) {
                base = validGrid[0].grams;
                calcDetails = `Tabela Manual: Usando valor base para menor idade (${validGrid[0].month} meses).`;
            } else if (fractionalMonths >= validGrid[validGrid.length - 1].month) {
                base = validGrid[validGrid.length - 1].grams;
                calcDetails = `Tabela Manual: Usando valor máximo (adulto / ${validGrid[validGrid.length - 1].month} meses).`;
            } else {
                for(let i=0; i<validGrid.length-1; i++) {
                   const p1 = validGrid[i];
                   const p2 = validGrid[i+1];
                   if (fractionalMonths >= p1.month && fractionalMonths <= p2.month) {
                       const ratio = (fractionalMonths - p1.month) / (p2.month - p1.month);
                       base = Math.round(p1.grams + ratio * (p2.grams - p1.grams));
                       calcDetails = `Tabela Manual: Interpolação linear exata para ${fractionalMonths.toFixed(1)} meses.`;
                       break;
                   }
                }
            }
        }
    }

    let meal1Grams = 0;
    let meal2Grams = 0;
    let actualFreq = freq;

    if (isAdult) {
        actualFreq = 2; // Always 2 for adult in this specific logic
        // We'll show an overview but not necessarily a single calculation here
        // as the percentages vary per day. 
        calcDetails = `Adulto: Plano semanal de 2 refeições ativado. Gramatura base fixa de ${base}g diários.`;
    } else {
        meal1Grams = Math.round(base / freq);
        meal2Grams = meal1Grams;
    }

    const portion = meal1Grams;
    
    setCalcResult({
      total: base,
      portion: portion,
      meal1: meal1Grams,
      meal2: meal2Grams,
      calcDetails: calcDetails,
      frequency: actualFreq,
      foodName: petInfo.foodName || profileForm.foodName || "Ração Genérica"
    });
  };

  const handleStartNfcScan = async () => {
    setIsScanningNfc(true);
    setNfcError(null);
    try {
      if (!("NDEFReader" in window)) {
        setNfcError(t("nfcNotSupported"));
        return;
      }
      const ndef = new window.NDEFReader();
      await ndef.scan();
      ndef.addEventListener("reading", ({ message, serialNumber }) => {
        // Tag lida com sucesso! Gravar ID.
        if (updateState) {
           updateState(prev => ({
              ...prev,
              petInfo: { ...prev.petInfo, microchip: serialNumber }
           }));
           setProfileForm(prev => ({ ...prev, microchip: serialNumber }));
        }
        setIsScanningNfc(false);
      });
      ndef.addEventListener("readingerror", () => {
        setNfcError(t("nfcError"));
      });
    } catch (error) {
       console.error(error);
       setNfcError(t("nfcError"));
    }
  };



  const saveSettings = () => {
    if (updateState && calcResult && !calcResult.error) {
      updateState(prev => {
        let newMeals = [...(prev.schedule.meals || [])];
        if (isAdult) {
          // If adult, ensure we have at least 2 meals and set their grams
          // If there are more than 2, the rest might be snacks or empty
          if (newMeals.length < 2) {
             newMeals = [
               { id: 'm1', time: '08:00', name: 'Breakfast' },
               { id: 'm2', time: '18:00', name: 'Dinner' }
             ];
          }
          newMeals = newMeals.map((m, idx) => {
            if (idx === 0) return { ...m, grams: calcResult.meal1 };
            if (idx === 1) return { ...m, grams: calcResult.meal2 };
            return { ...m, grams: 0 }; // Extra meals are zeroed out or snacks
          });
        } else {
          // Puppy: equal distribution or whatever interpolation says
          newMeals = newMeals.map(m => ({ ...m, grams: calcResult.portion }));
        }

        return {
          ...prev,
          schedule: {
            ...prev.schedule,
            gramsPerMeal: calcResult.portion, // Fallback for general display
            totalGrams: calcResult.total,
            frequency: calcResult.frequency,
            meals: newMeals
          }
        };
      });
    }
    setIsModalOpen(false);
  };

  const saveProfile = () => {
    if (updateState) {
      updateState(prev => ({
        ...prev,
        petInfo: {
          ...prev.petInfo,
          name: profileForm.name,
          birthDate: profileForm.birthDate,
          photoUrl: profileForm.photoUrl,
          breed: profileForm.breed,
          weight: parseFloat(profileForm.weight),
          microchip: profileForm.microchip,
          foodName: profileForm.foodName,
          foodDailyBase: parseInt(profileForm.foodDailyBase, 10),
          adultWeight: parseFloat(profileForm.adultWeight),
          gender: profileForm.gender,
          manualGrid: profileForm.manualGrid,
          adultWeeklyPercentages: profileForm.adultWeeklyPercentages
        }
      }));
    }
    setIsEditInfoOpen(false);
  };

  return (
    <main className="max-w-xl mx-auto px-6 pt-8 space-y-8 pb-32">
      {/* Hero Profile Section */}
      <section className="relative">
        <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden shadow-sm">
          <img
            alt={petInfo.name}
            className="w-full h-full object-cover"
            src={petInfo.photoUrl || profileForm.photoUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#914d00]/40 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6">
            <div className="backdrop-blur-xl bg-surface/60 p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-end">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-label text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1 block">{petInfo.breed || "Giant Puppy"}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${isAdult ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                      {isAdult ? 'Adulto' : 'Filhote'}
                    </span>
                  </div>
                  <h2 className="font-headline text-4xl font-extrabold text-primary tracking-tight">{petInfo.name}</h2>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditInfoOpen(true)}
                    className="bg-surface-variant text-on-surface font-body font-semibold p-2 rounded-full flex items-center transition-transform active:scale-95"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button 
                    onClick={() => {
                      setCalcResult(null);
                      setIsModalOpen(true);
                      setTimeout(handleCalculateMath, 150);
                    }}
                    className="bg-primary text-on-primary font-body font-semibold py-2 px-4 rounded-full flex items-center gap-2 transition-transform active:scale-95 shadow-md shadow-primary/20"
                  >
                    <span className="material-symbols-outlined text-lg">calculate</span>
                    {t("dietCalc")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container-low p-5 rounded-lg flex flex-col justify-between aspect-square">
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-secondary-container">fitness_center</span>
          </div>
          <div>
            <p className="font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">{t("weight")}</p>
            <p className="font-headline text-3xl font-bold text-on-surface">{petInfo.weight} <span className="text-lg font-medium text-on-surface-variant">kg</span></p>
            <p className="text-[10px] font-medium text-primary mt-1 border border-primary/20 bg-primary-container/30 px-2 py-0.5 rounded-sm inline-block">Adulto: {petInfo.adultWeight}kg</p>
          </div>
        </div>
        
        <div className="bg-tertiary-container p-5 rounded-lg flex flex-col justify-between aspect-square">
          <div className="w-10 h-10 rounded-full bg-on-tertiary-fixed flex items-center justify-center">
            <span className="material-symbols-outlined text-tertiary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
          </div>
          <div>
            <p className="font-label text-xs font-bold uppercase tracking-wider text-on-tertiary-container">{t("targetPortion")}</p>
            <p className="font-headline text-3xl font-bold text-on-tertiary-container">{schedule.gramsPerMeal || '---'}g</p>
            <p className="text-[10px] font-medium text-on-tertiary-container/70 mt-1">{t("perMeal")} ({schedule.frequency || 3}x)</p>
          </div>
        </div>
        
        <div className="col-span-2 bg-surface-container-lowest p-6 rounded-lg shadow-[0_4px_20px_rgba(145,77,0,0.04)] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">scale</span>
            </div>
            <div>
              <p className="font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">{t("dailyNeed")}</p>
              <p className="font-headline text-xl font-bold text-on-surface">{schedule.totalGrams || '--'}{t("perDay")}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-headline text-2xl font-bold text-primary">{bdayInfo.daysLeft}</p>
            <p className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">{t("daysLeft")}</p>
          </div>
        </div>
      </section>

      {/* Edit Info Modal */}
      {isEditInfoOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-xl rounded-3xl p-8 shadow-2xl relative mb-20">
            <button 
              onClick={() => setIsEditInfoOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-full bg-surface-container-high hover:bg-surface-variant active:scale-95 transition-all text-on-surface-variant"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline text-2xl font-bold text-on-surface mb-6">{t("editProfile")}</h3>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pb-4 pr-2">
              <div className="bg-surface-container p-4 rounded-xl">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">{t("petName")}</span>
                <input type="text" value={profileForm.name} onChange={e=>setProfileForm({...profileForm, name: e.target.value})} className="w-full bg-transparent font-bold text-lg text-primary border-b border-primary-container focus:outline-none p-1" />
              </div>

              <div className="bg-surface-container p-4 rounded-xl">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">{t("breed")}</span>
                <select 
                  value={profileForm.breed} 
                  onChange={e => handleFormChange('breed', e.target.value)} 
                  className="w-full bg-transparent font-bold text-lg text-primary border-b border-primary-container focus:outline-none p-1"
                >
                  <option value="Generic">Selecione uma Raça</option>
                  {breedData.map((b, i) => (
                    <option key={i} value={b.breed}>{b.breed}</option>
                  ))}
                </select>
              </div>

              <div className="bg-surface-container p-4 rounded-xl">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">{t("gender")}</span>
                <select 
                  value={profileForm.gender} 
                  onChange={e => handleFormChange('gender', e.target.value)} 
                  className="w-full bg-transparent font-bold text-lg text-primary border-b border-primary-container focus:outline-none p-1"
                >
                  <option value="male">{t("male")}</option>
                  <option value="female">{t("female")}</option>
                </select>
              </div>

              <h4 className="font-headline text-lg font-bold text-on-surface mt-6 border-b border-stone-200 pb-2">Plano de Ração</h4>

              <div className="bg-surface-container p-4 rounded-xl">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Marca / Ração</span>
                <input type="text" value={profileForm.foodName} placeholder="Ex: Royal Canin Maxi" onChange={e=>setProfileForm({...profileForm, foodName: e.target.value})} className="w-full bg-transparent font-bold text-lg text-primary border-b border-primary-container focus:outline-none p-1" />
              </div>

              <div className="bg-surface-container p-4 rounded-xl">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Meta Diária Fixa</span>
                <input type="number" value={profileForm.foodDailyBase} onChange={e=>setProfileForm({...profileForm, foodDailyBase: e.target.value})} className="w-full bg-transparent font-bold text-lg text-primary border-b border-primary-container focus:outline-none p-1" />
              </div>


              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container p-4 rounded-xl">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">{t("weight")} (kg)</span>
                  <input type="number" step="0.1" value={profileForm.weight} onChange={e=>setProfileForm({...profileForm, weight: e.target.value})} className="w-full bg-transparent font-bold text-lg text-primary border-b border-primary-container focus:outline-none p-1" />
                </div>
                <div className="bg-surface-container p-4 rounded-xl">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">{t("adultWeight")} (kg)</span>
                  <input type="number" step="0.1" value={profileForm.adultWeight} onChange={e=>setProfileForm({...profileForm, adultWeight: e.target.value})} className="w-full bg-transparent font-bold text-lg text-primary border-b border-primary-container focus:outline-none p-1" />
                </div>
              </div>

              <div className="bg-surface-container p-4 rounded-xl">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">{t("birthDate")}</span>
                <input type="date" value={profileForm.birthDate} onChange={e=>setProfileForm({...profileForm, birthDate: e.target.value})} className="w-full bg-transparent font-bold text-lg text-primary border-b border-primary-container focus:outline-none p-1" />
              </div>

              <div className="bg-surface-container p-4 rounded-xl">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">{t("photoUpload")}</span>
                <input type="file" accept="image/*" onChange={handleProfilePhotoUpload} className="w-full text-xs mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary-container file:text-on-primary-container hover:file:bg-primary-container/80 cursor-pointer text-on-surface" />
              </div>

              {/* Save */}
              <button 
                onClick={saveProfile}
                className="w-full mt-4 bg-primary flex items-center justify-center gap-2 text-on-primary py-4 rounded-full font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined">save</span>
                 {t("updateProfile")}
              </button>

              {/* Delete */}
              <button 
                onClick={() => {
                  if (window.confirm("Certeza que deseja apagar este perfil permanentemente?")) {
                    onDeletePet(rootState.activePetId);
                    setIsEditInfoOpen(false);
                  }
                }}
                className="w-full mt-4 bg-error-container/40 flex items-center justify-center gap-2 text-error py-4 rounded-full font-bold shadow-sm active:scale-95 transition-transform hover:bg-error-container"
              >
                <span className="material-symbols-outlined">delete_forever</span>
                 Apagar Perfil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cropper Modal Overlay */}
      {tempPhotoUrl && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-surface/95 backdrop-blur-xl animate-in fade-in duration-200">
           <div className="flex-1 relative">
             <Cropper
               image={tempPhotoUrl}
               crop={crop}
               zoom={zoom}
               rotation={rotation}
               aspect={1} 
               onCropChange={setCrop}
               onCropComplete={onCropComplete}
               onZoomChange={setZoom}
               onRotationChange={setRotation}
             />
           </div>
           
           <div className="bg-surface-container-high p-8 space-y-6 pb-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-3xl">
             <h3 className="font-headline text-xl font-bold text-on-surface">{t('cropPhoto')}</h3>
             
             {/* Slider Zoom */}
             <div className="flex flex-col gap-2">
               <label className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">{t('zoom')}</label>
               <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} className="w-full accent-primary bg-surface-variant h-2 rounded-full appearance-none outline-none" />
             </div>
             
             {/* Slider Rotation */}
             <div className="flex flex-col gap-2">
               <label className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">{t('rotate')}</label>
               <input type="range" value={rotation} min={0} max={360} step={1} onChange={(e) => setRotation(e.target.value)} className="w-full accent-primary bg-surface-variant h-2 rounded-full appearance-none outline-none" />
             </div>
             
             {/* Buttons */}
             <div className="flex gap-4 pt-2">
               <button onClick={() => setTempPhotoUrl(null)} className="flex-1 py-4 font-bold rounded-full bg-surface text-on-surface ring-1 ring-outline hover:bg-surface-variant active:scale-95 transition-all">
                 {t('cancel')}
               </button>
               <button onClick={handleConfirmCrop} className="flex-1 py-4 font-bold rounded-full bg-primary text-on-primary shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all">
                 {t('confirmEdit')}
               </button>
             </div>
           </div>
        </div>
      )}

      {/* General Information */}
      <section className="space-y-6">
        <h3 className="font-headline text-lg font-bold text-on-surface px-2">{t("generalInfo")}</h3>
        <div className="space-y-4">
          <div className="bg-surface-container p-5 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-outline">cake</span>
              <span className="font-body font-medium text-on-surface">{t("age")}</span>
            </div>
            <span className="font-body font-bold text-on-surface-variant">{calculateAgeStr(petInfo.birthDate)}</span>
          </div>
          <div className="bg-surface-container p-5 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
               <span className="material-symbols-outlined text-outline">public</span>
               <span className="font-body font-medium text-on-surface">Origem</span>
            </div>
            <span className="font-body font-bold text-on-surface-variant text-right max-w-[150px] truncate">{selectedBreedData.origin}</span>
          </div>
          <div className="bg-surface-container p-5 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-outline">fingerprint</span>
              <span className="font-body font-medium text-on-surface">{t("microchipId")}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-body font-bold text-on-surface-variant max-w-[120px] truncate">{petInfo.microchip || "--"}</span>
              <button onClick={handleStartNfcScan} className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors cursor-pointer shrink-0">
                <span className="material-symbols-outlined text-sm">contactless</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* NFC Modal */}
      {isScanningNfc && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-in fade-in duration-200">
           <div className="bg-surface w-full max-w-sm rounded-[2rem] p-8 shadow-2xl flex flex-col items-center text-center space-y-6">
              <div className="relative">
                 <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                 <div className="w-20 h-20 bg-primary rounded-full relative z-10 flex items-center justify-center text-on-primary shadow-xl">
                    <span className="material-symbols-outlined text-4xl">contactless</span>
                 </div>
              </div>
              <div>
                 <h3 className="font-headline text-2xl font-bold text-on-surface mb-2">{t("nfcScanTitle")}</h3>
                 <p className="text-sm font-medium text-on-surface-variant">{nfcError || t("nfcScanDesc")}</p>
              </div>
              <button 
                 onClick={() => setIsScanningNfc(false)}
                 className="w-full py-4 rounded-full font-bold bg-surface-container-high text-on-surface-variant hover:bg-surface-variant active:scale-95 transition-all"
              >
                 {t("stopScan")}
              </button>
           </div>
        </div>
      )}

      {/* Maths Calc Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-xl rounded-3xl p-6 shadow-2xl relative mb-20 max-h-[85vh] overflow-y-auto">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-full bg-surface-container-high hover:bg-surface-variant active:scale-95 transition-all text-on-surface-variant"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-tertiary-container">psychology</span>
                </div>
                <div>
                   <h3 className="font-headline text-2xl font-bold text-on-surface">Cálculo de Ração</h3>
                   <p className="text-[11px] uppercase tracking-wider font-bold text-tertiary">Divisão Baseada no Pacote</p>
                </div>
            </div>

            <div className="space-y-6">
              {!calcResult && (
                <div className="py-8 flex flex-col items-center justify-center bg-surface-container-low rounded-xl">
                  <div className="w-8 h-8 border-4 border-tertiary-fixed border-t-transparent flex rounded-full animate-spin mb-3"></div>
                  <p className="font-bold text-sm text-on-surface-variant animate-pulse">{t("processing")}</p>
                </div>
              )}

              {/* Result Area */}
              {calcResult && !calcResult.error && (
                <div className="bg-secondary-container text-on-secondary-container p-6 rounded-2xl space-y-5 shadow-inner">
                  <div className="flex flex-col">
                    <span className="uppercase text-[10px] tracking-widest font-bold opacity-80 mb-1">{t("suggestedPortion")} (Frequency: {calcResult.frequency}x)</span>
                    <p className="font-headline text-4xl font-extrabold">{calcResult.portion}g <span className="text-xl font-medium opacity-80">/pote</span></p>
                  </div>
                  
                  <div className="bg-white/20 p-4 rounded-xl space-y-1 backdrop-blur-md">
                     <p className="font-bold text-sm flex justify-between items-center">
                        {t("preciseDailyTotal")} <span className="text-lg bg-surface/80 text-on-surface px-2 py-0.5 rounded-md">{calcResult.total}g</span>
                     </p>
                     <p className="text-xs font-medium opacity-80">{t("refInterpolated")}: {calcResult.calcDetails}</p>
                  </div>
                </div>
              )}

              {calcResult && calcResult.error && (
                 <div className="bg-error-container text-on-error-container p-6 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="material-symbols-outlined text-2xl">error</span>
                       <p className="font-bold text-lg">Rejeição Clínica</p>
                    </div>
                    <p className="text-sm font-medium leading-relaxed">{calcResult.error}</p>
                 </div>
              )}

              {/* WEEKLY PLANNER FOR ADULTS */}
              {isAdult && (
                <div className="space-y-4">
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                    <h5 className="font-bold text-sm text-primary mb-1">Planejador Semanal de Porcentagem</h5>
                    <p className="text-[10px] text-on-surface-variant">Defina a porcentagem da primeira refeição para cada dia.</p>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { id: 1, label: "Segunda" },
                      { id: 2, label: "Terça" },
                      { id: 3, label: "Quarta" },
                      { id: 4, label: "Quinta" },
                      { id: 5, label: "Sexta" },
                      { id: 6, label: "Sábado" },
                      { id: 0, label: "Domingo" }
                    ].map((day) => {
                      const pct = profileForm.adultWeeklyPercentages[day.id] || 50;
                      const base = parseInt(profileForm.foodDailyBase, 10) || 300;
                      const m1 = Math.round(base * (pct / 100));
                      const m2 = base - m1;
                      
                      return (
                        <div key={day.id} className="bg-surface-container-low p-3 rounded-xl border border-stone-100 dark:border-stone-800">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-xs text-on-surface">{day.label}</span>
                            <div className="flex gap-2 text-[10px] font-bold">
                               <span className="text-primary">{m1}g</span>
                               <span className="text-stone-400">/</span>
                               <span className="text-secondary">{m2}g</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <input 
                              type="range" 
                              min="10" 
                              max="90" 
                              step="5" 
                              value={pct} 
                              onChange={e => {
                                setProfileForm({
                                  ...profileForm,
                                  adultWeeklyPercentages: {
                                    ...profileForm.adultWeeklyPercentages,
                                    [day.id]: parseInt(e.target.value, 10)
                                  }
                                });
                              }}
                              className="flex-1 accent-primary" 
                            />
                            <span className="font-bold text-primary w-10 text-right text-xs">{pct}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MANUAL GRID PLANNER inside Calculator (PUPPY ONLY) */}
              {!isAdult && (
                <div className="bg-surface-container p-4 rounded-xl border border-primary-container/50 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full flex items-start justify-end p-2">
                    <span className="material-symbols-outlined text-primary/40 text-xl">table_chart</span>
                 </div>
                 <h5 className="font-bold text-sm text-on-surface mb-1">Entrada Manual Interativa</h5>
                 <p className="text-xs text-on-surface-variant mb-4">Insira os dados da embalagem para o peso objetivo adulto (<span className="font-bold text-primary">{petInfo.adultWeight}kg</span>). O sistema calculará a gramatura diária exata por interpolação.</p>
                 <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Quantos meses a tabela informa?</label>
                 <input type="number" 
                        value={profileForm.manualGrid?.length || ""} 
                        onChange={(e) => {
                           let count = parseInt(e.target.value, 10);
                           if (e.target.value === "") {
                               setProfileForm({...profileForm, manualGrid: []});
                           } else if (!isNaN(count) && count >= 0 && count <= 24) {
                               const newGrid = Array.from({length: count}).map((_, i) => profileForm.manualGrid?.[i] || { month: '', grams: '' });
                               setProfileForm({...profileForm, manualGrid: newGrid});
                           }
                        }} 
                        className="w-full bg-transparent font-bold text-lg text-primary border-b border-primary-container focus:outline-none p-1 mb-4" 
                        placeholder="Ex: 4" 
                 />
                 
                 {profileForm.manualGrid && profileForm.manualGrid.length > 0 && (
                     <div className="space-y-3 mt-4 bg-surface/50 p-3 rounded-lg border border-outline-variant/30">
                        {profileForm.manualGrid.map((row, idx) => (
                            <div key={idx} className="flex gap-3">
                                <div className="flex-1">
                                    <span className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1">Mês</span>
                                    <input type="number" value={row.month} tabIndex={idx > 0 ? -1 : undefined} onChange={e => {
                                        const newGrid = [...profileForm.manualGrid];
                                        newGrid[idx].month = e.target.value;
                                        
                                        if (idx === 0) {
                                            const startMonth = parseInt(e.target.value, 10);
                                            if (!isNaN(startMonth)) {
                                                for(let k = 1; k < newGrid.length; k++) {
                                                    newGrid[k].month = String(startMonth + k);
                                                }
                                            }
                                        }
                                        
                                        setProfileForm({...profileForm, manualGrid: newGrid});
                                    }} className="w-full bg-surface-container-high rounded-md p-2.5 text-sm focus:outline-primary font-bold transition-all shadow-inner border border-transparent focus:border-primary/30" placeholder="Ex: 2"/>
                                </div>
                                <div className="flex-1">
                                    <span className="text-[10px] font-bold uppercase text-on-surface-variant block mb-1">Gramas/Dia</span>
                                    <input type="number" value={row.grams} onChange={e => {
                                        const newGrid = [...profileForm.manualGrid];
                                        newGrid[idx].grams = e.target.value;
                                        setProfileForm({...profileForm, manualGrid: newGrid});
                                    }} className="w-full bg-surface-container-high rounded-md p-2.5 text-sm focus:outline-primary font-bold transition-all shadow-inner border border-transparent focus:border-primary/30" placeholder="Ex: 250"/>
                                </div>
                            </div>
                        ))}
                        <button 
                           onClick={() => {
                              // Force calculation whenever grid changes manually
                              if (updateState) {
                                  updateState(prev => ({...prev, petInfo: {...prev.petInfo, manualGrid: profileForm.manualGrid}}));
                              }
                              handleCalculateMath();
                           }}
                           className="w-full mt-2 bg-primary/10 text-primary py-3 rounded-xl font-bold flex justify-center items-center gap-2 active:scale-95 transition-transform"
                        >
                           <span className="material-symbols-outlined">sync</span>
                           Atualizar Cálculo
                        </button>
                     </div>
                 )}
                </div>
              )}


              {/* Save */}
              <button 
                disabled={calcResult?.error}
                onClick={saveSettings}
                className="w-full bg-primary disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 text-on-primary py-4 rounded-full font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined">save</span>
                 {t("applyPlanning")}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
