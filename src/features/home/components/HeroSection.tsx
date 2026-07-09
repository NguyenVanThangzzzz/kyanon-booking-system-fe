import { SearchBar } from './SearchBar';

export const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-teal-400 overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/5 rounded-full" />
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-white/5 rounded-full" />
      <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-white/5 rounded-full" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container-app relative z-10 pt-14 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-3xl mx-auto text-center mb-10">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Hơn 10.000 phòng nghỉ trên toàn Việt Nam
          </div>

          {/* Headline */}
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 text-balance leading-tight">
            Bạn lựa chọn
            <br />
            <span className="text-white/90">phòng nghỉ nào?</span>
          </h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            Hàng nghìn phòng nghỉ với mức giá tốt nhất đang chờ bạn khám phá.
          </p>
        </div>

        {/* Search bar */}
        <div className="max-w-5xl mx-auto">
          <SearchBar />
        </div>

        {/* Quick stats */}
        <div className="flex flex-wrap justify-center gap-6 mt-10 text-white/80 text-sm">
          {[
            { icon: '🛏️', label: '10.000+ phòng nghỉ' },
            { icon: '⭐', label: 'Đánh giá 4.8/5' },
            { icon: '💰', label: 'Giá tốt nhất' },
            { icon: '🔒', label: 'Thanh toán an toàn' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span>{icon}</span>
              <span className="font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute -bottom-px left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 28C840 36 960 40 1080 38C1200 36 1320 28 1380 24L1440 20V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" fill="#fafaf9" />
        </svg>
      </div>
    </section>
  );
};
