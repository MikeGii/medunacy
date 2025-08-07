// src/components/analytics/StatCard.tsx
interface StatCardProps {
  title: string;
  icon: string;
  stats: Array<{
    label: string;
    value: string | number | React.ReactNode;
  }>;
  bgColor: string;
  borderColor: string;
}

export default function StatCard({
  title,
  icon,
  stats,
  bgColor,
  borderColor
}: StatCardProps) {
  return (
    <div className={`${bgColor} rounded-xl p-6 border ${borderColor}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-700">{title}</h4>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{stat.label}:</span>
            <span className="font-medium text-gray-900">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}