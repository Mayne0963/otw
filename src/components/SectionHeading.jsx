"use client";

// No useState import needed

export default function SectionHeading({
  title,
  subtitle,
  centered = true,
  accentColor = "primary-red",
}) {
  // No state needed for this component

  const colorClass =
    accentColor === "primary-red" ? "bg-primary-red" : "bg-accent-gold";
  const alignment = centered ? "mx-auto text-center" : "";

  return (
    <div className={`mb-12 ${alignment}`}>
      <h2 className="text-3xl md:text-5xl font-bold mb-6">{title}</h2>
      <div
        className={`w-24 h-1 ${colorClass} ${centered ? "mx-auto" : ""} mb-6`}
      ></div>
      {subtitle && <p className="text-xl text-gray-300">{subtitle}</p>}
    </div>
  );
}
