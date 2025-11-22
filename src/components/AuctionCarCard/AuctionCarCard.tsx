import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuctionCar } from '@/hooks/useAuctionCar';

interface AuctionCarCardProps {
  auctionId?: string;
}

// Generate mock sparkline data
const generateSparklineData = (trend: 'up' | 'down' | 'neutral', points: number = 20) => {
  const data: number[] = [];
  let base = 50;
  
  for (let i = 0; i < points; i++) {
    if (trend === 'up') {
      base += Math.random() * 3 - 0.5;
    } else if (trend === 'down') {
      base -= Math.random() * 3 - 0.5;
    } else {
      base += Math.random() * 2 - 1;
    }
    data.push(Math.max(10, Math.min(90, base)));
  }
  
  return data;
};

export default function AuctionCarCard({ auctionId }: AuctionCarCardProps = {}) {
  const { auction, isLoading, error } = useAuctionCar({ auctionId });

  if (isLoading) {
    return (
      <div className="bg-[#F5F5F5] rounded-xl overflow-hidden border border-gray-200 p-5">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-100 rounded"></div>
          <div className="h-4 bg-gray-100 rounded w-3/4"></div>
          <div className="h-20 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="bg-[#F5F5F5] rounded-xl overflow-hidden border border-gray-200 p-5">
        <p className="text-red-500">Failed to load auction data</p>
      </div>
    );
  }

  const {
    image,
    title,
    currentBid,
    marketPrice,
    priceTrend,
    views5m,
    watchers,
    bids1h,
    endsAt,
    urgent = false,
    live = false,
  } = auction;
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [progress, setProgress] = useState(100);
  const [isHovered, setIsHovered] = useState(false);

  // Calculate price difference
  const priceDiff = currentBid - marketPrice;
  const priceDiffPercent = ((priceDiff / marketPrice) * 100).toFixed(2);

  // Generate sparkline data
  const sparklineData = useMemo(() => generateSparklineData(priceTrend), [priceTrend]);

  // Countdown timer logic
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endsAt).getTime();
      const difference = end - now;

      if (difference > 0) {
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        // Calculate progress (assuming 24h auction)
        const totalDuration = 24 * 60 * 60 * 1000; // 24 hours in ms
        const elapsed = totalDuration - difference;
        const progressPercent = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));

        setTimeLeft({ hours, minutes, seconds });
        setProgress(progressPercent);
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        setProgress(100);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [endsAt]);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="bg-[#F5F5F5] rounded-xl overflow-hidden border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 w-full max-w-full">
      {/* Main Image Section */}
      <div
        className="relative w-full h-64 overflow-hidden bg-[#F5F5F5]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.img
          src={image}
          alt={title}
          className="w-full h-full object-cover rounded-t-xl"
          animate={{
            scale: isHovered ? 1.1 : 1,
          }}
          transition={{
            duration: 0.4,
            ease: 'easeOut',
          }}
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/800x400/1a1a1a/888888?text=No+Image';
          }}
        />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          {live && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg"
            >
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              LIVE
            </motion.div>
          )}
          {urgent && !live && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-yellow-500 text-black px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg"
            >
              ⚡ Urgent
            </motion.div>
          )}
          {priceTrend !== 'neutral' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${
                priceTrend === 'up' ? 'bg-green-600' : 'bg-red-600'
              } text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg`}
            >
              Price{priceTrend === 'up' ? '↑' : '↓'}
            </motion.div>
          )}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-4">
        {/* Title Line */}
        <h3 className="text-gray-900 text-lg font-semibold leading-tight truncate">
          {title}
        </h3>

        {/* Price Block */}
        <div className="bg-[#F5F5F5] rounded-lg p-4 border border-gray-200">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <p className="text-gray-600 text-xs mb-1">Current Bid</p>
              <p className="text-gray-900 text-3xl font-bold">
                {formatCurrency(currentBid)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-600 text-xs mb-1">Market Price</p>
              <p className="text-gray-600 text-lg">{formatCurrency(marketPrice)}</p>
            </div>
          </div>

          {/* Price Difference */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-semibold ${
                  priceDiff >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {priceDiff >= 0 ? '+' : ''}
                {formatCurrency(Math.abs(priceDiff))}
              </span>
              <span
                className={`text-xs font-medium ${
                  priceDiff >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                ({priceDiff >= 0 ? '+' : ''}
                {priceDiffPercent}%)
              </span>
            </div>
          </div>

          {/* Sparkline Graph */}
          <div className="h-12 w-full relative">
            <svg
              className="w-full h-full"
              viewBox={`0 0 ${sparklineData.length * 10} 50`}
              preserveAspectRatio="none"
            >
              <polyline
                fill="none"
                stroke={priceTrend === 'up' ? '#22c55e' : priceTrend === 'down' ? '#ef4444' : '#888'}
                strokeWidth="2"
                points={sparklineData
                  .map((point, index) => `${index * 10},${50 - point}`)
                  .join(' ')}
              />
            </svg>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="bg-[#F5F5F5] rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-center gap-1 mb-2">
            <motion.span
              key={`hours-${timeLeft.hours}`}
              initial={{ scale: 1.2, color: '#ef4444' }}
              animate={{ scale: 1, color: '#1f2937' }}
              className="text-3xl font-bold text-gray-900 tabular-nums"
            >
              {String(timeLeft.hours).padStart(2, '0')}
            </motion.span>
            <span className="text-3xl font-bold text-red-500">:</span>
            <motion.span
              key={`minutes-${timeLeft.minutes}`}
              initial={{ scale: 1.2, color: '#ef4444' }}
              animate={{ scale: 1, color: '#1f2937' }}
              className="text-3xl font-bold text-gray-900 tabular-nums"
            >
              {String(timeLeft.minutes).padStart(2, '0')}
            </motion.span>
            <span className="text-3xl font-bold text-red-500">:</span>
            <motion.span
              key={`seconds-${timeLeft.seconds}`}
              initial={{ scale: 1.2, color: '#ef4444' }}
              animate={{ scale: 1, color: '#1f2937' }}
              className="text-3xl font-bold text-gray-900 tabular-nums"
            >
              {String(timeLeft.seconds).padStart(2, '0')}
            </motion.span>
          </div>
          <p className="text-gray-600 text-xs text-center mb-2">Time Remaining</p>
          
          {/* Progress Bar */}
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-red-600"
              initial={{ width: '100%' }}
              animate={{ width: `${100 - progress}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
        </div>

        {/* Market Interest Section */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#F5F5F5] rounded-lg p-3 border border-gray-200 text-center">
            <p className="text-gray-600 text-xs mb-1">Views (5m)</p>
            <p className="text-gray-900 text-lg font-bold">{formatNumber(views5m)}</p>
          </div>
          <div className="bg-[#F5F5F5] rounded-lg p-3 border border-gray-200 text-center">
            <p className="text-gray-600 text-xs mb-1">Watchers</p>
            <p className="text-gray-900 text-lg font-bold">{formatNumber(watchers)}</p>
          </div>
          <div className="bg-[#F5F5F5] rounded-lg p-3 border border-gray-200 text-center">
            <p className="text-gray-600 text-xs mb-1">Bids (1h)</p>
            <p className="text-gray-900 text-lg font-bold">{formatNumber(bids1h)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-red-500/50"
          >
            Place Bid
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[#F5F5F5] hover:bg-gray-100 text-gray-900 font-semibold py-3 px-4 rounded-lg border border-gray-300 transition-all duration-200"
          >
            Watch Lot
          </motion.button>
        </div>
      </div>
    </div>
  );
}

