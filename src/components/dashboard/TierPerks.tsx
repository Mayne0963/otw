import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Crown, Shield, Star } from "lucide-react"

const tiers = [
  {
    name: "Bronze",
    icon: Star,
    color: "text-orange-400",
    perks: ["Priority support during peak hours", "5% off all services", "Access to community events"],
    price: 9.99,
  },
  {
    name: "Silver",
    icon: Shield,
    color: "text-gray-400",
    perks: ["All Bronze perks", "15% off all services", "Free monthly service credit", "Exclusive rep selection"],
    price: 19.99,
  },
  {
    name: "Gold",
    icon: Crown,
    color: "text-otw-gold",
    perks: [
      "All Silver perks",
      "25% off all services",
      "Priority emergency service",
      "Monthly rewards bonus",
      "VIP community status",
    ],
    price: 29.99,
  },
]

export default function TierPerks() {
  const currentTier = "Bronze" // This would come from user data

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-otw-gold mb-2">Your Current Tier: {currentTier}</h2>
        <p className="text-gray-400">Upgrade your tier to unlock more benefits and savings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const Icon = tier.icon
          const isCurrentTier = tier.name === currentTier

          return (
            <Card key={tier.name} className={`p-6 relative ${isCurrentTier ? "border-2 border-otw-gold" : ""}`}>
              {isCurrentTier && (
                <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-otw-gold text-black text-xs px-2 py-1 rounded-full">
                  Current Tier
                </span>
              )}

              <div className="text-center mb-6">
                <div className="inline-block p-3 rounded-full bg-gray-800 mb-4">
                  <Icon className={`w-8 h-8 ${tier.color}`} />
                </div>
                <h3 className={`text-xl font-bold ${tier.color}`}>{tier.name}</h3>
                <p className="text-2xl font-bold mt-2">
                  ${tier.price}
                  <span className="text-sm text-gray-400">/month</span>
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-otw-gold" />
                    <span className="text-sm">{perk}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  isCurrentTier ? "bg-gray-700 cursor-not-allowed" : "bg-otw-red hover:bg-otw-gold hover:text-black"
                }`}
                disabled={isCurrentTier}
              >
                {isCurrentTier ? "Current Plan" : "Upgrade"}
              </Button>
            </Card>
          )
        })}
      </div>

      <Card className="p-6 bg-gradient-to-r from-otw-red to-otw-gold mt-8">
        <div className="text-center text-black">
          <h3 className="text-xl font-bold mb-2">Special Offer</h3>
          <p className="mb-4">Upgrade to Gold now and get your first month at 50% off!</p>
          <Button variant="secondary">Claim Offer</Button>
        </div>
      </Card>
    </div>
  )
}
