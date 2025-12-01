
export type Sport = {
  id: string;
  name: string;
  icon?: string;
  pricePerHour: number;
  gradient: string;
  image: string;
};

export const SPORTS: Sport[] = [
  { id: "football", name: "Football", icon: "⚽", pricePerHour: 1500, gradient: "from-green-500 to-emerald-600", image: "https://images.unsplash.com/photo-1713815713124-362af0201f3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHR1cmYlMjBmaWVsZHxlbnwxfHx8fDE3NjMxODcxMzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
  { id: "cricket", name: "Cricket", icon: "🏏", pricePerHour: 1200, gradient: "from-blue-500 to-cyan-600", image: "https://images.unsplash.com/photo-1512719994953-eabf50895df7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmlja2V0JTIwc3RhZGl1bXxlbnwxfHx8fDE3NjMyMjIyMzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
  { id: "swimming", name: "Swimming", icon: "🏊", pricePerHour: 800, gradient: "from-blue-400 to-blue-600", image: "https://images.unsplash.com/photo-1558617320-e695f0d420de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2ltbWluZyUyMHBvb2x8ZW58MXx8fHwxNzYzMjM1NzQ2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
];
