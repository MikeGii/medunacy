// src/components/home/TeamSection.tsx
'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function TeamSection() {
  const t = useTranslations('team');

  const doctors = [
    {
      name: t('doctors.doctor1.name'),
      specialization: t('doctors.doctor1.specialization'),
      description: t('doctors.doctor1.description'),
      image: '/images/doctor1.jpg' // You'll need to add these images
    },
    {
      name: t('doctors.doctor2.name'),
      specialization: t('doctors.doctor2.specialization'),
      description: t('doctors.doctor2.description'),
      image: '/images/doctor2.jpg'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-[#FBF6E9] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#118B50] mb-6">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {doctors.map((doctor, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              {/* Doctor Image */}
              <div className="relative mb-6">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-[#E3F0AF] to-[#5DB996] p-1">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <Image
                      src={doctor.image}
                      alt={doctor.name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Professional badge */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="bg-[#118B50] text-white px-3 py-1 rounded-full text-xs font-medium">
                    {t('verified_doctor')}
                  </div>
                </div>
              </div>

              {/* Doctor Info */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-[#118B50] mb-2">
                  {doctor.name}
                </h3>
                <p className="text-[#5DB996] font-semibold mb-4">
                  {doctor.specialization}
                </p>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {doctor.description}
                </p>
              </div>

              {/* Decorative element */}
              <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-[#E3F0AF]/20 to-[#5DB996]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* Bottom Text */}
        <div className="text-center mt-12">
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('bottom_text')}
          </p>
        </div>
      </div>
    </section>
  );
}