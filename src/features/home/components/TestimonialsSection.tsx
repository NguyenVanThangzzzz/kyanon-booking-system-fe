import { SectionHeader } from './SectionHeader';
import { StarRating } from '@/common/components/ui/StarRating/StarRating';
import { useInView } from '@/common/hooks/useInView';
import { cn } from '@/common/utils/cn';

const REVIEWS = [
  {
    id: '1',
    name: 'Nguyễn Thị Lan',
    location: 'Hà Nội',
    avatar: 'https://i.pravatar.cc/64?img=47',
    rating: 5,
    room: 'Phòng Deluxe — InterContinental Hanoi',
    comment:
      'Dịch vụ tuyệt vời, phòng rộng và thoáng mát. Nhân viên rất nhiệt tình và chuyên nghiệp. Tôi sẽ quay lại lần sau!',
    date: 'Tháng 3, 2025',
  },
  {
    id: '2',
    name: 'Trần Minh Khoa',
    location: 'TP.HCM',
    avatar: 'https://i.pravatar.cc/64?img=12',
    rating: 5,
    room: 'Phòng Ocean Suite — Fusion Maia Đà Nẵng',
    comment:
      'Kỳ nghỉ hoàn hảo! Bãi biển riêng rất đẹp, bể bơi vô cực view biển. Ăn sáng buffet đa dạng và ngon. Rất đáng tiền.',
    date: 'Tháng 2, 2025',
  },
  {
    id: '3',
    name: 'Phạm Hồng Nhung',
    location: 'Đà Nẵng',
    avatar: 'https://i.pravatar.cc/64?img=32',
    rating: 4,
    room: 'Phòng Villa Riêng — Four Seasons Nam Hải',
    comment:
      'View biển cực đẹp, phòng được thiết kế tinh tế theo phong cách Hội An. Dịch vụ 5 sao thực sự. Hơi đắt nhưng xứng đáng.',
    date: 'Tháng 1, 2025',
  },
];

export const TestimonialsSection = () => {
  const { ref, inView } = useInView();

  return (
    <section className="section-pad">
      <div ref={ref} className={cn('container-app animate-section', inView && 'visible')}>
        <SectionHeader
          eyebrow="Đánh giá"
          title="Khách hàng nói gì về chúng tôi"
          subtitle="Hàng nghìn lượt đánh giá thực tế từ khách hàng đã trải nghiệm"
          center
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((review) => (
            <div key={review.id} className="card p-6 flex flex-col gap-4 stagger-card">
              <StarRating rating={review.rating} size="md" />
              <p className="text-neutral-600 text-sm leading-relaxed flex-1">
                &ldquo;{review.comment}&rdquo;
              </p>
              <p className="text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full self-start">
                {review.room}
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-neutral-100">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{review.name}</p>
                  <p className="text-xs text-neutral-400">{review.location} · {review.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall rating */}
        <div className="mt-10 bg-gradient-to-r from-primary-500 to-teal-400 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-white stagger-card">
          <div>
            <p className="text-4xl font-bold">4.8 / 5</p>
            <p className="mt-1 text-white/80">Điểm trung bình từ 50.000+ đánh giá</p>
          </div>
          <div className="flex gap-8 text-center">
            {[
              { label: 'Sạch sẽ', value: '4.9' },
              { label: 'Dịch vụ', value: '4.8' },
              { label: 'Vị trí', value: '4.7' },
              { label: 'Giá trị', value: '4.8' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm text-white/75">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
