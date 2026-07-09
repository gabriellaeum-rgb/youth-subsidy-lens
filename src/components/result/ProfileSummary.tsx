import { MapPin, User, GraduationCap, BookOpen, Heart, Briefcase, Tag, Wallet } from 'lucide-react';
import type { Profile } from '@/types';
import { SIDO_SHORT, type Sido } from '@/lib/regions';

export function ProfileSummary({ profile }: { profile: Profile }) {
  const sidoShort = SIDO_SHORT[profile.region.sido as Sido] ?? profile.region.sido;
  const region = profile.region.sigungu ? `${sidoShort} ${profile.region.sigungu}` : sidoShort;
  const income = profile.incomeManwon !== undefined ? `월 ${profile.incomeManwon}만원` : '제한없음';

  const chips = [
    { icon: MapPin, value: region },
    { icon: User, value: `만 ${profile.age}세` },
    { icon: GraduationCap, value: profile.education },
    { icon: BookOpen, value: profile.major },
    { icon: Heart, value: profile.marital },
    { icon: Briefcase, value: profile.employment },
    { icon: Tag, value: profile.specialization.join(', ') },
    { icon: Wallet, value: income },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto md:flex-wrap [-webkit-overflow-scrolling:touch] pb-1">
      {chips.map((c, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-2 rounded-pill bg-bg-inset text-ink-700 px-3 py-1 text-caption whitespace-nowrap shrink-0"
        >
          <c.icon size={14} aria-hidden />
          {c.value}
        </span>
      ))}
    </div>
  );
}
