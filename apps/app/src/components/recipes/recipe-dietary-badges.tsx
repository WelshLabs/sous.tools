import React from "react";

interface RecipeDietaryBadgesProps {
  dietaryFlags: Record<string, boolean>;
}

export const RecipeDietaryBadges: React.FC<RecipeDietaryBadgesProps> = ({ dietaryFlags }) => {
  if (!dietaryFlags) return null;

  const labels: Record<string, { label: string; color: string }> = {
    vegan: { label: "Vegan", color: "bg-emerald-950/40 border border-emerald-500/30 text-emerald-400" },
    vegetarian: { label: "Vegetarian", color: "bg-green-950/40 border border-green-500/30 text-green-400" },
    pescetarian: { label: "Pescetarian", color: "bg-teal-950/40 border border-teal-500/30 text-teal-400" },
    keto: { label: "Keto", color: "bg-indigo-950/40 border border-indigo-500/30 text-indigo-400" },
    gluten_free: { label: "Gluten Free", color: "bg-amber-950/40 border border-amber-500/30 text-amber-400" },
    dairy_free: { label: "Dairy Free", color: "bg-sky-950/40 border border-sky-500/30 text-sky-400" },
    egg_free: { label: "Egg Free", color: "bg-yellow-950/40 border border-yellow-500/30 text-yellow-400" },
    nut_free: { label: "Nut Free", color: "bg-red-950/40 border border-red-500/30 text-red-400" },
    low_sodium: { label: "Low Sodium", color: "bg-blue-950/40 border border-blue-500/30 text-blue-400" },
    high_protein: { label: "High Protein", color: "bg-pink-950/40 border border-pink-500/30 text-pink-400" },
  };

  const activeBadges = Object.entries(dietaryFlags)
    .filter(([_, active]) => active)
    .map(([key]) => labels[key])
    .filter(Boolean);

  if (activeBadges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {activeBadges.map((badge, idx) => (
        <span key={idx} className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${badge.color}`}>
          {badge.label}
        </span>
      ))}
    </div>
  );
};
