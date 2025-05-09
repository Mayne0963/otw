import { Restaurant } from "@/lib/restaurants"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign, MapPin, Star, Check } from "lucide-react"

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Card className="overflow-hidden bg-[#1A1A1A] border-[#333333] hover:border-[#FFD700] transition-all duration-300 h-full flex flex-col">
      <Link href={`/restaurants/${restaurant.id}`} className="flex-grow">
        <div className="relative h-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
          <Image
            src={restaurant.image || "/placeholder.svg"}
            alt={restaurant.name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          />
          <div className="absolute bottom-0 left-0 p-4 z-20 flex items-center gap-2">
            <div className="h-12 w-12 bg-white rounded-full p-1 flex items-center justify-center overflow-hidden">
              <Image
                src={restaurant.logo || "/placeholder.svg"}
                alt={`${restaurant.name} logo`}
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            {restaurant.isPartner && <Badge className="bg-[#FFD700] text-black text-xs font-medium">OTW Partner</Badge>}
          </div>
        </div>
        <CardContent className="p-4 flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-white">{restaurant.name}</h3>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-[#FFD700] fill-[#FFD700]" />
              <span className="text-white font-medium">{restaurant.rating}</span>
              <span className="text-gray-400 text-sm">({restaurant.reviewCount})</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {restaurant.categories.map((category) => (
              <Badge key={category} variant="outline" className="text-xs text-gray-300 border-gray-600">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Badge>
            ))}
          </div>

          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{restaurant.description}</p>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="flex items-center gap-1 text-sm text-gray-300">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>{restaurant.deliveryTime}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-300">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span>${restaurant.deliveryFee.toFixed(2)} delivery</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-300">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{restaurant.distance.toFixed(1)} mi</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-300">
              <span className="text-gray-400">{restaurant.priceLevel}</span>
              <span>Price Level</span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}