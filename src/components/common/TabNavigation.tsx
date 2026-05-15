import React from "react";
import { LucideIcon } from "lucide-react";

interface Tab {
  key: string;
  label: string;
  icon?: LucideIcon;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex gap-1.5 bg-slate-100 border border-slate-200 rounded-xl p-1.5">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm transition ${
              active
                ? "bg-white text-violet-700 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/60"
            }`}
          >
            {Icon && <Icon className={`w-4 h-4 ${active ? "text-violet-600" : "text-slate-400"}`} />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default TabNavigation;
