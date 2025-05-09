import { cn } from "../../lib/utils"

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  containerClassName?: string
  as?: keyof JSX.IntrinsicElements
}

export function Section({
  children,
  className,
  containerClassName,
  as: Component = "section",
  ...props
}: SectionProps) {
  return (
    <Component
      className={cn(
        "w-full py-12 md:py-16 lg:py-20",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "container mx-auto px-4 sm:px-6 lg:px-8",
          containerClassName
        )}
      >
        {children}
      </div>
    </Component>
  )
}

export function SectionHeader({
  title,
  description,
  className,
}: {
  title: string
  description?: string
  className?: string
}) {
  return (
    <div className={cn("max-w-3xl mx-auto text-center mb-12 md:mb-16", className)}>
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-lg leading-8 text-white/70">
          {description}
        </p>
      )}
    </div>
  )
} 