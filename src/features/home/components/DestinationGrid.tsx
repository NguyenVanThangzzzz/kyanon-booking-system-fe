import { Link } from 'react-router-dom';
import { SectionHeader } from './SectionHeader';
import { useInView } from '@/common/hooks/useInView';
import { cn } from '@/common/utils/cn';

interface Destination {
  name: string;
  roomCount: number;
  image: string;
  slug: string;
}

const DESTINATIONS: Destination[] = [
  {
    name: 'Đà Nẵng',
    roomCount: 1240,
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=700&q=80',
    slug: 'danang',
  },
  {
    name: 'Hội An',
    roomCount: 890,
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&q=80',
    slug: 'hoian',
  },
  {
    name: 'Nha Trang',
    roomCount: 1560,
    image: 'https://images.unsplash.com/photo-1540202403-b7abd6747a18?w=600&q=80',
    slug: 'nhatrang',
  },
  {
    name: 'Phú Quốc',
    roomCount: 780,
    image: 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=700&q=80',
    slug: 'phuquoc',
  },
  {
    name: 'Hà Nội',
    roomCount: 2340,
    image: 'https://images.unsplash.com/photo-1598163218773-f27eb4f05e3a?w=600&q=80',
    slug: 'hanoi',
  },
  {
    name: 'Hồ Chí Minh',
    roomCount: 3120,
    image: 'https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=600&q=80',
    slug: 'hcm',
  },
  {
    name: 'Đà Lạt',
    roomCount: 650,
    image: 'https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?w=700&q=80',
    slug: 'dalat',
  },
  {
    name: 'Sapa',
    roomCount: 420,
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=700&q=80',
    slug: 'sapa',
  },
];

const DestCard = ({ dest }: { dest: Destination }) => (
  <Link
    to={`/rooms?dest=${dest.slug}`}
    className="group relative h-full rounded-2xl overflow-hidden block bg-neutral-300"
  >
    <img
      src={dest.image}
      alt={dest.name}
      loading="lazy"
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 p-4">
      <h3 className="text-white font-bold text-lg leading-tight">{dest.name}</h3>
      <p className="text-white/75 text-sm mt-0.5">
        {dest.roomCount.toLocaleString('vi-VN')} phòng
      </p>
    </div>
  </Link>
);

export const DestinationGrid = () => {
  const { ref, inView } = useInView();

  return (
    <section className="section-pad bg-neutral-100/60">
      <div
        ref={ref}
        className={cn('container-app animate-section', inView && 'visible')}
      >
        <SectionHeader
          eyebrow="Các điểm đến"
          title="Điểm đến hot nhất"
          subtitle="Khám phá những thành phố du lịch hàng đầu tại Việt Nam"
          center
        />

        {/*
          4-col masonry on desktop:
          Row 1-2: Đà Nẵng (tall) | Hội An | Nha Trang | Phú Quốc (tall)
          Row 3:   Đà Lạt (wide)             | Sapa (wide)
        */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4"
          style={{ gridAutoRows: '180px' }}
        >
          {/* Đà Nẵng — tall left */}
          <div className="row-span-2 stagger-card">
            <DestCard dest={DESTINATIONS[0]!} />
          </div>

          {/* Hội An */}
          <div className="stagger-card">
            <DestCard dest={DESTINATIONS[1]!} />
          </div>

          {/* Nha Trang */}
          <div className="stagger-card">
            <DestCard dest={DESTINATIONS[2]!} />
          </div>

          {/* Phú Quốc — tall right */}
          <div className="row-span-2 stagger-card">
            <DestCard dest={DESTINATIONS[3]!} />
          </div>

          {/* Hà Nội */}
          <div className="stagger-card">
            <DestCard dest={DESTINATIONS[4]!} />
          </div>

          {/* Hồ Chí Minh */}
          <div className="stagger-card">
            <DestCard dest={DESTINATIONS[5]!} />
          </div>

          {/* Đà Lạt — bottom-left wide */}
          <div className="col-span-2 stagger-card">
            <DestCard dest={DESTINATIONS[6]!} />
          </div>

          {/* Sapa — bottom-right wide */}
          <div className="col-span-2 stagger-card">
            <DestCard dest={DESTINATIONS[7]!} />
          </div>
        </div>
      </div>
    </section>
  );
};
