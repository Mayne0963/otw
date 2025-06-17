'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { useCart } from '../../lib/context/CartContext';
import { Tag, X, Check, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export const PromoCodeInput: React.FC = () => {
  const {
    appliedPromoCode,
    promoCodeError,
    applyPromoCode,
    removePromoCode,
    promoCodes,
    subtotal,
  } = useCart();
  
  const [promoInput, setPromoInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [showAvailableCodes, setShowAvailableCodes] = useState(false);

  const handleApplyPromoCode = async () => {
    if (!promoInput.trim()) return;
    
    setIsApplying(true);
    const success = applyPromoCode(promoInput.trim());
    
    if (success) {
      setPromoInput('');
      setShowAvailableCodes(false);
    }
    
    setIsApplying(false);
  };

  const handleRemovePromoCode = () => {
    removePromoCode();
    setPromoInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyPromoCode();
    }
  };

  const availableCodes = promoCodes.filter(
    (code) => code.isActive && subtotal >= code.minOrderAmount
  );

  return (
    <Card className="border-dashed border-2 border-orange-200">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-gray-900">Promo Code</span>
            </div>
            {availableCodes.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAvailableCodes(!showAvailableCodes)}
                className="text-orange-600 hover:text-orange-700"
              >
                {showAvailableCodes ? 'Hide' : 'Show'} Available
              </Button>
            )}
          </div>

          {/* Applied Promo Code */}
          {appliedPromoCode && (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <div>
                  <span className="font-medium text-green-900">
                    {appliedPromoCode.code}
                  </span>
                  <p className="text-sm text-green-700">
                    {appliedPromoCode.description}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemovePromoCode}
                className="text-green-600 hover:text-green-700"
                aria-label="Remove promo code"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Promo Code Input */}
          {!appliedPromoCode && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  onKeyPress={handleKeyPress}
                  className={cn(
                    "flex-1",
                    promoCodeError && "border-red-300 focus:border-red-500"
                  )}
                  disabled={isApplying}
                  aria-describedby={promoCodeError ? "promo-error" : undefined}
                />
                <Button
                  onClick={handleApplyPromoCode}
                  disabled={!promoInput.trim() || isApplying}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isApplying ? 'Applying...' : 'Apply'}
                </Button>
              </div>
              
              {/* Error Message */}
              {promoCodeError && (
                <div className="flex items-center gap-2 text-red-600" id="promo-error">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{promoCodeError}</span>
                </div>
              )}
            </div>
          )}

          {/* Available Promo Codes */}
          {showAvailableCodes && availableCodes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Available Codes:</h4>
              <div className="grid gap-2">
                {availableCodes.map((code) => (
                  <div
                    key={code.code}
                    className="flex items-center justify-between p-2 bg-orange-50 border border-orange-200 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
                    onClick={() => {
                      setPromoInput(code.code);
                      handleApplyPromoCode();
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setPromoInput(code.code);
                        handleApplyPromoCode();
                      }
                    }}
                  >
                    <div>
                      <Badge variant="secondary" className="mb-1">
                        {code.code}
                      </Badge>
                      <p className="text-xs text-gray-600">{code.description}</p>
                      {code.minOrderAmount > 0 && (
                        <p className="text-xs text-gray-500">
                          Min order: ${code.minOrderAmount.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-orange-600 hover:text-orange-700"
                    >
                      Apply
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PromoCodeInput;