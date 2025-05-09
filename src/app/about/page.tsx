import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us | On The Way",
  description: "Learn about On The Way's mission, values, and team",
}

export const dynamic = "force-dynamic"

export default function AboutPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">About On The Way</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're on a mission to make delivery services more accessible, reliable, and community-focused.
          </p>
        </div>
        
        {/* Mission Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Our Mission</h2>
            <p className="text-lg text-muted-foreground">
              At On The Way, we believe everyone deserves access to reliable delivery services, regardless of where they live. 
              We're committed to building a platform that connects communities, supports local businesses, and provides 
              opportunities for drivers to earn on their own terms.
            </p>
            <p className="text-lg text-muted-foreground">
              {/* Terms Page Link */}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
