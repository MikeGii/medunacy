// src/components/profile/ProfileTabs/ProfileTabs.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ProfileForm from "./ProfileForm";
import ProfileData from "./ProfileData";

export default function ProfileTabs() {
  const t = useTranslations("profile.tabs");
  const [activeTab, setActiveTab] = useState<"professional" | "personal">("professional");

  const tabs = [
    {
      id: "professional" as const,
      label: t("professional"),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "personal" as const,
      label: t("personal"),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="relative py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="bg-white/40 backdrop-blur-md rounded-t-2xl md:rounded-t-3xl border border-white/50 border-b-0">
          <div className="flex flex-col sm:flex-row">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-3 px-6 py-4 transition-all duration-300
                  ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white shadow-lg'
                    : 'text-gray-600 hover:text-[#118B50] hover:bg-white/50'
                  }
                  ${tab.id === 'professional' 
                    ? 'rounded-tl-2xl md:rounded-tl-3xl sm:rounded-tr-none rounded-tr-2xl' 
                    : 'rounded-tr-2xl md:rounded-tr-3xl sm:rounded-tl-none rounded-tl-2xl'
                  }
                  border-b-2 ${activeTab === tab.id ? 'border-[#118B50]' : 'border-transparent'}
                `}
              >
                <span className={`${activeTab === tab.id ? 'text-white' : 'text-[#5DB996]'}`}>
                  {tab.icon}
                </span>
                <span className="font-semibold text-sm md:text-base">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/40 backdrop-blur-md rounded-b-2xl md:rounded-b-3xl rounded-t-none -mt-px">
          {activeTab === "professional" ? (
            <ProfileForm />
          ) : (
            <ProfileData />
          )}
        </div>
      </div>
    </section>
  );
}