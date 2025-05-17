import Image from "next/image";
import { Card } from "../ui/card"
import { Award, Clock, Heart } from "lucide-react"

const mockStories = [
  {
    id: 1,
    name: "Sarah Johnson",
    image: "/placeholder-user.jpg",
    hours: 156,
    badges: ["Emergency Hero", "Senior Support"],
    story:
      "I've been volunteering with OTW for 6 months, and it's been incredible to see the direct impact we have on our community. From helping seniors with groceries to emergency assistance during storms, every day brings new opportunities to make a difference.",
  },
  {
    id: 2,
    name: "Mike Thompson",
    image: "/placeholder-user.jpg",
    hours: 89,
    badges: ["Moving Master", "Community Star"],
    story:
      "Being part of the OTW volunteer team has shown me just how much we can accomplish when we work together. The moving assistance program has been particularly rewarding - helping families transition to their new homes with dignity and support.",
  },
]

export default function VolunteerFeed() {
  return (
    <div className="space-y-6">
      {mockStories.map((story) => (
        <Card key={story.id} className="p-6">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
              <Image src={story.image} alt={story.name} width={64} height={64} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{story.name}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {story.hours} hours
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 text-otw-red" />
                    Volunteer
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {story.badges.map((badge) => (
                  <div key={badge} className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-800 text-xs">
                    <Award className="w-3 h-3 text-otw-gold" />
                    {badge}
                  </div>
                ))}
              </div>

              <p className="text-gray-300">{story.story}</p>

              <div className="flex justify-end">
                <button className="text-sm text-otw-gold hover:text-otw-red transition-colors">
                  Read full story →
                </button>
              </div>
            </div>
          </div>
        </Card>
      ))}

      <div className="text-center">
        <button className="text-otw-gold hover:text-otw-red transition-colors">Load more stories...</button>
      </div>
    </div>
  )
}
