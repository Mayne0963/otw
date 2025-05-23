import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Clock, MapPin, DollarSign, Star } from "lucide-react";

const mockOrders = [
  {
    id: "OTW-1234",
    date: "2024-03-15",
    service: "Food Delivery",
    status: "Completed",
    amount: 25.99,
    tip: 5,
    rep: "John D.",
    rating: 5,
  },
  {
    id: "OTW-1235",
    date: "2024-03-14",
    service: "Moving Help",
    status: "Completed",
    amount: 89.99,
    tip: 15,
    rep: "Sarah M.",
    rating: 4,
  },
  // Add more mock orders as needed
];

export default function OrderHistory() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gray-900">
          <h3 className="text-lg font-semibold text-otw-gold mb-2">
            Total Orders
          </h3>
          <p className="text-3xl font-bold">24</p>
        </Card>
        <Card className="p-6 bg-gray-900">
          <h3 className="text-lg font-semibold text-otw-gold mb-2">
            Total Tips
          </h3>
          <p className="text-3xl font-bold">$156</p>
        </Card>
        <Card className="p-6 bg-gray-900">
          <h3 className="text-lg font-semibold text-otw-gold mb-2">
            Avg Rating
          </h3>
          <p className="text-3xl font-bold">4.8</p>
        </Card>
      </div>

      <div className="space-y-4">
        {mockOrders.map((order) => (
          <Card key={order.id} className="p-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{order.service}</h3>
                  <span className="text-sm text-gray-400">#{order.id}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {order.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Fort Wayne
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-otw-gold" />
                  <span className="font-semibold">${order.amount}</span>
                  <span className="text-sm text-gray-400">
                    (+${order.tip} tip)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-otw-gold" />
                  <span>{order.rating}/5</span>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
