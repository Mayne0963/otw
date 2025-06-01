import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { MapPin, Star, Heart } from "lucide-react";
import Image from "next/image";

const favoriteLocations = [
  {
    id: 1,
    name: "Home",
    address: "1234 Coliseum Blvd, Fort Wayne, IN 46805",
    type: "Residential",
  },
  {
    id: 2,
    name: "Work",
    address: "200 E Berry St, Fort Wayne, IN 46802",
    type: "Commercial",
  },
  {
    id: 3,
    name: "Family",
    address: "5678 Lima Rd, Fort Wayne, IN 46808",
    type: "Residential",
  },
];

const favoriteReps = [
  {
    id: 1,
    name: "Marcus T.",
    rating: 4.9,
    orders: 47,
    specialties: ["Food Delivery", "Grocery Shopping"],
    image: "/assets/team/rep-1.jpg",
  },
  {
    id: 2,
    name: "Jessica L.",
    rating: 4.8,
    orders: 32,
    specialties: ["Package Delivery", "Errands"],
    image: "/assets/team/rep-2.jpg",
  },
];

export default function Favorites() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-otw-gold">
            Saved Locations
          </h2>
          <Button variant="outline" size="sm">
            Add Location
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favoriteLocations.map((location) => (
            <Card key={location.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-otw-gold" />
                    <h3 className="font-semibold">{location.name}</h3>
                  </div>
                  <p className="text-sm text-gray-400">{location.address}</p>
                  <span className="text-xs text-gray-500 mt-1 block">
                    {location.type}
                  </span>
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
          <h2 className="text-2xl font-semibold text-otw-gold">
            Preferred Reps
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favoriteReps.map((rep) => (
            <Card key={rep.id} className="p-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden relative">
                  <Image
                    src={rep.image}
                    alt={rep.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{rep.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-otw-gold" />
                      <span className="text-sm">{rep.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">
                    {rep.orders} orders completed
                  </p>
                  <div className="flex gap-2 mt-2">
                    {rep.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="text-xs px-2 py-1 rounded-full bg-gray-800"
                      >
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
  );
}
