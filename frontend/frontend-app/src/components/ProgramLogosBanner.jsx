import React from 'react';

const bannerLogos = [
  { src: '/formacion.png', alt: 'Fase 2 Formación', className: 'h-12 sm:h-14 md:h-16' },
  { src: '/logos.png', alt: 'Aliados institucionales', className: 'h-10 sm:h-12 md:h-14' },
  { src: '/sgr.png', alt: 'SGR', className: 'h-12 sm:h-14 md:h-16' },
];

const ProgramLogosBanner = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#006837] via-[#00844a] to-[#0a8a49]">
      <div className="absolute inset-0 opacity-10">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: 'url(https://i.ibb.co/bjnFfp1v/ELEMENTOS-FONDO-01.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            mixBlendMode: 'overlay',
          }}
        />
      </div>
      <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-4 px-4 py-4 sm:gap-6 sm:px-6 lg:justify-between lg:px-8">
        {bannerLogos.map((logo) => (
          <img
            key={logo.src}
            src={logo.src}
            alt={logo.alt}
            className={`${logo.className} w-auto object-contain drop-shadow-lg`}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgramLogosBanner;
