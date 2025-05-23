import React, { useState } from "react";
import { Card } from "./card";
import { Copy, CheckCircle, Star, Loader2 } from "lucide-react";
import Image from "next/image";

interface QRCodeTipProps {
  rep: {
    name: string;
    photo: string;
    rating: number;
    completedDeliveries: number;
  };
  tipUrl: string;
}

export default function QRCodeTip({ rep, tipUrl }: QRCodeTipProps) {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCopy = async () => {
    try {
      setIsLoading(true);
      await navigator.clipboard.writeText(tipUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-sm mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden">
          <Image
            src={rep.photo}
            alt={rep.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
        <div>
          <h3 className="font-semibold">{rep.name}</h3>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Star className="w-4 h-4 text-otw-gold" aria-hidden="true" />
            <span>
              {rep.rating} • {rep.completedDeliveries} deliveries
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="relative w-48 h-48">
          <Image
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(tipUrl)}`}
            alt={`QR code to tip ${rep.name}`}
            fill
            className="object-contain"
            sizes="192px"
          />
        </div>
        <p className="text-sm text-center text-gray-500">
          Scan to tip {rep.name} for their excellent service!
        </p>
      </div>

      <button
        onClick={handleCopy}
        disabled={isLoading || copied}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-otw-red text-white rounded-lg hover:bg-otw-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={copied ? "Link copied" : "Copy tip link"}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : copied ? (
          <>
            <CheckCircle className="w-5 h-5" aria-hidden="true" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-5 h-5" aria-hidden="true" />
            Copy Tip Link
          </>
        )}
      </button>
    </Card>
  );
}
