'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Clock, 
  Zap, 
  Truck, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Star, 
  Shield, 
  Timer, 
  Package,
  Flame,
  Wind,
  Snowflake
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  estimatedTime: string;
  price: number;
  originalPrice?: number;
  icon: React.ReactNode;
  features: string[];
  popular?: boolean;
  premium?: boolean;
  availability: 'available' | 'limited' | 'unavailable';
  cutoffTime?: string;
  nextAvailable?: string;
}

interface DeliverySpeedSelectorProps {
  orderType?: 'grocery' | 'package' | 'restaurant' | 'pharmacy';
  distance?: number; // in miles
  orderValue?: number;
  onSpeedSelect?: (option: DeliveryOption) => void;
  selectedSpeed?: string;
  className?: string;
}

const getDeliveryOptions = (orderType: string, distance: number = 5, orderValue: number = 0): DeliveryOption[] => {
  const baseOptions: DeliveryOption[] = [
    {
      id: 'express',
      name: 'Express Delivery',
      description: 'Get it as fast as possible',
      estimatedTime: '15-30 min',
      price: 8.99,
      originalPrice: 12.99,
      icon: <Zap className="w-5 h-5" />,
      features: ['Priority handling', 'Real-time tracking', 'SMS updates'],
      popular: true,
      availability: 'available',
      cutoffTime: '11:30 PM'
    },
    {
      id: 'rush',
      name: 'Rush Delivery',
      description: 'Fast delivery when you need it',
      estimatedTime: '30-45 min',
      price: 5.99,
      originalPrice: 7.99,
      icon: <Flame className="w-5 h-5" />,
      features: ['Fast processing', 'Live tracking', 'Priority support'],
      availability: 'available',
      cutoffTime: '11:45 PM'
    },
    {
      id: 'standard',
      name: 'Standard Delivery',
      description: 'Reliable delivery at great value',
      estimatedTime: '45-60 min',
      price: 3.99,
      icon: <Truck className="w-5 h-5" />,
      features: ['Standard processing', 'GPS tracking', 'Email updates'],
      availability: 'available'
    },
    {
      id: 'economy',
      name: 'Economy Delivery',
      description: 'Budget-friendly option',
      estimatedTime: '60-90 min',
      price: 1.99,
      icon: <Package className="w-5 h-5" />,
      features: ['Basic tracking', 'Cost effective'],
      availability: 'available'
    },
    {
      id: 'scheduled',
      name: 'Scheduled Delivery',
      description: 'Choose your preferred time',
      estimatedTime: 'Your choice',
      price: 2.99,
      icon: <Calendar className="w-5 h-5" />,
      features: ['Time slot selection', 'Advance booking', 'Flexible timing'],
      availability: 'available'
    }
  ];

  // Adjust pricing based on distance
  const distanceMultiplier = Math.max(1, distance / 5);
  
  // Adjust pricing based on order type
  const typeMultipliers = {
    grocery: 1.0,
    restaurant: 1.2,
    package: 0.9,
    pharmacy: 1.1
  };
  
  const typeMultiplier = typeMultipliers[orderType as keyof typeof typeMultipliers] || 1.0;
  
  return baseOptions.map(option => {
    let adjustedPrice = option.price * distanceMultiplier * typeMultiplier;
    
    // Free delivery for orders over certain amount
    if (orderValue >= 35 && ['standard', 'economy'].includes(option.id)) {
      adjustedPrice = 0;
    }
    
    // Premium delivery for high-value orders
    if (orderValue >= 100 && option.id === 'express') {
      return {
        ...option,
        price: Math.max(0, adjustedPrice - 3),
        premium: true,
        features: [...option.features, 'Premium handling', 'White glove service']
      };
    }
    
    // Time-based availability
    const currentHour = new Date().getHours();
    let availability = option.availability;
    
    if (option.id === 'express' && currentHour >= 23) {
      availability = 'unavailable';
    } else if (option.id === 'rush' && currentHour >= 23.5) {
      availability = 'limited';
    }
    
    return {
      ...option,
      price: Math.round(adjustedPrice * 100) / 100,
      availability
    };
  });
};

export default function EnhancedDeliverySpeedSelector({
  orderType = 'grocery',
  distance = 5,
  orderValue = 0,
  onSpeedSelect,
  selectedSpeed,
  className
}: DeliverySpeedSelectorProps) {
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>(selectedSpeed || '');
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const options = getDeliveryOptions(orderType, distance, orderValue);
    setDeliveryOptions(options);
    
    // Auto-select the most popular available option if none selected
    if (!selectedSpeed) {
      const popularOption = options.find(opt => opt.popular && opt.availability === 'available');
      if (popularOption) {
        setSelectedOption(popularOption.id);
        onSpeedSelect?.(popularOption);
      }
    }
  }, [orderType, distance, orderValue, selectedSpeed, onSpeedSelect]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  const handleOptionSelect = (option: DeliveryOption) => {
    if (option.availability === 'unavailable') return;
    
    setSelectedOption(option.id);
    onSpeedSelect?.(option);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-green-400';
      case 'limited': return 'text-yellow-400';
      case 'unavailable': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available': return 'Available';
      case 'limited': return 'Limited slots';
      case 'unavailable': return 'Unavailable';
      default: return 'Unknown';
    }
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'FREE' : `$${price.toFixed(2)}`;
  };

  const getSavingsAmount = (option: DeliveryOption) => {
    if (!option.originalPrice || option.price >= option.originalPrice) return null;
    return option.originalPrice - option.price;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-otw-gold" />
            Delivery Speed
          </h3>
          <p className="text-gray-400 text-sm">
            Choose your preferred delivery time
          </p>
        </div>
        {orderValue >= 35 && (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <Shield className="w-3 h-3 mr-1" />
            Free delivery eligible
          </Badge>
        )}
      </div>

      <div className="grid gap-3">
        {deliveryOptions.map((option, index) => {
          const isSelected = selectedOption === option.id;
          const isUnavailable = option.availability === 'unavailable';
          const savings = getSavingsAmount(option);
          
          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={cn(
                  "cursor-pointer transition-all duration-200 relative overflow-hidden",
                  isSelected 
                    ? "border-otw-gold bg-otw-gold/10 shadow-lg shadow-otw-gold/20" 
                    : "border-gray-600 bg-gray-800/50 hover:border-gray-500",
                  isUnavailable && "opacity-50 cursor-not-allowed",
                  option.popular && !isSelected && "border-blue-500/50 bg-blue-500/5"
                )}
                onClick={() => handleOptionSelect(option)}
              >
                {option.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-lg font-medium">
                      Most Popular
                    </div>
                  </div>
                )}
                
                {option.premium && (
                  <div className="absolute top-0 left-0">
                    <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded-br-lg font-medium flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Premium
                    </div>
                  </div>
                )}

                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={cn(
                        "p-2 rounded-lg",
                        isSelected ? "bg-otw-gold/20 text-otw-gold" : "bg-gray-700 text-gray-300"
                      )}>
                        {option.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-white">{option.name}</h4>
                          {isSelected && (
                            <CheckCircle className="w-4 h-4 text-otw-gold" />
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{option.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Timer className="w-3 h-3 text-gray-500" />
                            <span className="text-gray-300">{option.estimatedTime}</span>
                          </div>
                          <div className={cn(
                            "flex items-center gap-1 text-xs",
                            getAvailabilityColor(option.availability)
                          )}>
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              option.availability === 'available' && "bg-green-400",
                              option.availability === 'limited' && "bg-yellow-400",
                              option.availability === 'unavailable' && "bg-red-400"
                            )} />
                            {getAvailabilityText(option.availability)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={cn(
                          "text-lg font-bold",
                          option.price === 0 ? "text-green-400" : "text-white"
                        )}>
                          {formatPrice(option.price)}
                        </div>
                        {savings && (
                          <Badge variant="destructive" className="text-xs">
                            Save ${savings.toFixed(2)}
                          </Badge>
                        )}
                      </div>
                      {option.originalPrice && option.price < option.originalPrice && (
                        <div className="text-gray-500 text-sm line-through">
                          ${option.originalPrice.toFixed(2)}
                        </div>
                      )}
                      {option.cutoffTime && (
                        <div className="text-gray-400 text-xs">
                          Until {option.cutoffTime}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Features */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {option.features.slice(0, 3).map((feature, idx) => (
                      <Badge 
                        key={idx} 
                        variant="secondary" 
                        className="text-xs bg-gray-700/50 text-gray-300"
                      >
                        {feature}
                      </Badge>
                    ))}
                    {option.features.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-gray-400 hover:text-white p-1 h-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDetails(showDetails === option.id ? null : option.id);
                        }}
                      >
                        +{option.features.length - 3} more
                      </Button>
                    )}
                  </div>
                  
                  {/* Expanded Details */}
                  <AnimatePresence>
                    {showDetails === option.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-gray-600"
                      >
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-white">All Features:</h5>
                          <div className="grid grid-cols-2 gap-1">
                            {option.features.map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-1 text-xs text-gray-300">
                                <CheckCircle className="w-3 h-3 text-green-400" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
      
      {/* Delivery Info */}
      <div className="bg-gray-800/30 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-otw-gold" />
          <span className="text-white font-medium text-sm">Delivery Guarantee</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span>Real-time tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span>Safe handling</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span>On-time delivery</span>
          </div>
        </div>
        
        {orderValue < 35 && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 font-medium text-sm">Free Delivery Available</span>
            </div>
            <p className="text-blue-300 text-xs">
              Add ${(35 - orderValue).toFixed(2)} more to qualify for free standard delivery
            </p>
          </div>
        )}
      </div>
      
      {/* Weather Impact Notice */}
      {(() => {
        const hour = currentTime.getHours();
        const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
        const isLateNight = hour >= 22 || hour <= 6;
        
        if (isRushHour || isLateNight) {
          return (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-medium text-sm">
                  {isRushHour ? 'Rush Hour Notice' : 'Late Night Service'}
                </span>
              </div>
              <p className="text-yellow-300 text-xs">
                {isRushHour 
                  ? 'Delivery times may be slightly longer due to high demand'
                  : 'Limited delivery options available during late night hours'
                }
              </p>
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
}