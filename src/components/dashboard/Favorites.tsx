import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { MapPin, Star, Heart } from "lucide-react"
import Image from "next/image"

const mockLocations = [
  {
    id: 1,
    name: "Home",
    address: "123 Main St, Fort Wayne, IN 46802",
    type: "Residential",
  },
  {
    id: 2,
    name: "Work",
    address: "456 Business Ave, Fort Wayne, IN 46825",
    type: "Commercial",
  },
  {
    id: 3,
    name: "Mom's House",
    address: "789 Family Rd, Fort Wayne, IN 46814",
    type: "Residential",
  },
]

const mockReps = [
  {
    id: 1,
    name: "John D.",
    rating: 4.9,
    orders: 12,
    specialties: ["Food Delivery", "Errands"],
    image: "/placeholder-user.jpg",
  },
  {
    id: 2,
    name: "Sarah M.",
    rating: 4.8,
    orders: 8,
    specialties: ["Moving Help", "Roadside"],
    image: "/placeholder-user.jpg",
  },
]

export default function Favorites() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-otw-gold">Saved Locations</h2>
          <Button variant="outline" size="sm">
            Add Location
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockLocations.map((location) => (
            <Card key={location.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-otw-gold" />
                    <h3 className="font-semibold">{location.name}</h3>
                  </div>
                  <p className="text-sm text-gray-400">{location.address}</p>
                  <span className="text-xs text-gray-500 mt-1 block">{location.type}</span>
                </div>
                <Button variant="ghost" size="icon">
                  <Heart className="w-4 h-4 text-otw-red" fill="currentColor" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-otw-gold">Preferred Reps</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockReps.map((rep) => (
            <Card key={rep.id} className="p-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden relative">
                  <Image src={rep.image} alt={rep.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{rep.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-otw-gold" />
                      <span className="text-sm">{rep.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">{rep.orders} orders completed</p>
                  <div className="flex gap-2 mt-2">
                    {rep.specialties.map((specialty) => (
                      <span key={specialty} className="text-xs px-2 py-1 rounded-full bg-gray-800">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
