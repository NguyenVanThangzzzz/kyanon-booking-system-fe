import { useInView } from '@/common/hooks/useInView';
import { cn } from '@/common/utils/cn';

const PARTNERS = [
  { id: 1, name: 'Stellar of the Seas' },
  { id: 2, name: 'Genesis Regal' },
  { id: 3, name: 'Paradise Vietnam' },
  { id: 4, name: 'Capella Cruise' },
  { id: 5, name: 'Bhaya Cruises' },
  { id: 6, name: 'Rosy Cruise' },
  { id: 7, name: 'Heritage Cruises' },
  { id: 8, name: 'Catherine Cruise' },
  { id: 9, name: 'Scarlet Pearl' },
  { id: 10, name: 'Ambassador Cruise' },
  { id: 11, name: 'Essence Grand' },
  { id: 12, name: 'Indochina Sails' },
  { id: 13, name: 'Le Theatre Cruise' },
  { id: 14, name: 'Orchid Cruises' },
];

export const PartnerLogos = () => {
  const { ref, inView } = useInView();

  return (
    <section className="py-12 lg:py-16 relative bg-[url('/section-background.png')] bg-cover bg-center">
      <div ref={ref} className={cn('container-app animate-section', inView && 'visible')}>
        {/* Section header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-sm font-medium text-primary-600 mb-2">Đối tác tin cậy</p>
            <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900">
              Đối tác Cùng các<br className="hidden lg:block" /> Khu Nghỉ Dưỡng Lớn
            </h2>
            <div className="flex gap-1 mt-3">
              <span className="w-8 h-0.5 bg-primary-500 rounded-full" />
              <span className="w-2 h-0.5 bg-primary-300 rounded-full" />
              <span className="w-2 h-0.5 bg-primary-200 rounded-full" />
            </div>
          </div>
          <p className="text-neutral-500 text-sm lg:text-base max-w-sm lg:text-right leading-relaxed">
            Đối tác hàng đầu với các khu nghỉ dưỡng danh tiếng. Ưu đãi phòng độc quyền dành riêng cho bạn.
          </p>
        </div>

        {/* Logo grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
          {PARTNERS.map(({ id, name }) => (
            <div
              key={id}
              className="stagger-card bg-white rounded-2xl shadow-sm flex items-center justify-center p-5 cursor-default"
            >
              <img
                src={`/partners/partner${id}.png`}
                alt={name}
                width={140}
                height={70}
                loading="lazy"
                className="w-full h-14 object-contain grayscale"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
