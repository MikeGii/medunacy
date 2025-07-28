// src/components/privacy-policy/PrivacyContent.tsx
"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import PrivacySection from "./PrivacySection";

export default function PrivacyContent() {
  const t = useTranslations();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = [
    "introduction",
    "data_collection",
    "data_usage",
    "legal_basis",
    "data_sharing",
    "data_retention",
    "user_rights",
    "changes"
  ];

  const handleSectionClick = (section: string) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(section);
    }
  };

  const renderTableOfContents = () => {
    return sections.map((sectionName, index) => (
      <a
        key={sectionName}
        href={`#${sectionName}`}
        className="block text-gray-600 hover:text-[#118B50] transition-colors duration-200 py-1"
        onClick={(e) => {
          e.preventDefault();
          handleSectionClick(sectionName);
        }}
      >
        {index + 1}. {t.raw(`privacy.sections.${sectionName}.title`)}
      </a>
    ));
  };

  const renderSections = () => {
    return sections.map((sectionName) => (
      <PrivacySection
        key={sectionName}
        id={sectionName}
        title={t.raw(`privacy.sections.${sectionName}.title`)}
        content={t.raw(`privacy.sections.${sectionName}.content`)}
        isActive={activeSection === sectionName}
      />
    ));
  };

  return (
    <section className="py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-[#118B50] mb-4">
            {t("privacy.table_of_contents")}
          </h2>
          <nav className="space-y-2">
            {renderTableOfContents()}
          </nav>
        </div>

        <div className="space-y-8">
          {renderSections()}
        </div>

        <div className="mt-12 p-6 bg-[#E3F0AF]/20 border border-[#5DB996] rounded-xl">
          <p className="text-sm text-gray-600 text-center">
            {t("privacy.agreement_notice")}
          </p>
        </div>
      </div>
    </section>
  );
}