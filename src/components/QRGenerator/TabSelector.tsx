import React from 'react';
import { Globe, AlignLeft, Wifi, Mail, Phone, MessageSquare } from 'lucide-react';
import { QRType } from '../../types/qr';

interface TabSelectorProps {
  activeTab: QRType;
  onSelectTab: (tab: QRType) => void;
}

interface TabItem {
  id: QRType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const TabSelector: React.FC<TabSelectorProps> = ({ activeTab, onSelectTab }) => {
  const tabs: TabItem[] = [
    { id: 'url', label: 'URL / Link', icon: Globe },
    { id: 'text', label: 'Plain Text', icon: AlignLeft },
    { id: 'wifi', label: 'Wi-Fi Network', icon: Wifi },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'phone', label: 'Phone Call', icon: Phone },
    { id: 'sms', label: 'SMS Message', icon: MessageSquare },
  ];

  return (
    <div className="w-full">
      {/* Tab bar container */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl overflow-x-auto no-scrollbar border border-slate-200/60">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-blue-600 shadow-sm shadow-slate-900/5 ring-1 ring-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
