import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const currentPath = location.pathname;

  const getNavClass = (path) => {
    const isActive = currentPath === path;
    if (isActive) {
      return "flex flex-col items-center justify-center bg-[#fdd34d] dark:bg-[#914d00] text-[#34322c] dark:text-[#fff7f4] rounded-full px-5 py-2 scale-105 active:scale-95 duration-200 ease-out";
    }
    return "flex flex-col items-center justify-center text-[#625f58] dark:text-stone-400 opacity-70 hover:opacity-100 transition-opacity";
  };

  const getIconStyle = (path) => {
    return currentPath === path ? { fontVariationSettings: "'FILL' 1" } : {};
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-[#fef9f3]/80 dark:bg-stone-950/80 backdrop-blur-xl shadow-[0_-4px_20px_rgba(145,77,0,0.08)] rounded-t-[2.5rem] border-t-0">
      <Link to="/dashboard" className={getNavClass('/dashboard')}>
        <span className="material-symbols-outlined" style={getIconStyle('/dashboard')}>home</span>
        <span className="font-['Be_Vietnam_Pro'] text-[11px] font-semibold uppercase tracking-wider mt-1">{t("navHome")}</span>
      </Link>
      <Link to="/history" className={getNavClass('/history')}>
        <span className="material-symbols-outlined" style={getIconStyle('/history')}>history</span>
        <span className="font-['Be_Vietnam_Pro'] text-[11px] font-semibold uppercase tracking-wider mt-0.5">{t("navHistory")}</span>
      </Link>
      <Link to="/profile" className={getNavClass('/profile')}>
        <span className="material-symbols-outlined" style={getIconStyle('/profile')}>pets</span>
        <span className="font-['Be_Vietnam_Pro'] text-[11px] font-semibold uppercase tracking-wider mt-1">{t("navProfile")}</span>
      </Link>
      <Link to="/settings" className={getNavClass('/settings')}>
        <span className="material-symbols-outlined" style={getIconStyle('/settings')}>settings</span>
        <span className="font-['Be_Vietnam_Pro'] text-[11px] font-semibold uppercase tracking-wider mt-1">{t("navSettings")}</span>
      </Link>
    </nav>
  );
}

