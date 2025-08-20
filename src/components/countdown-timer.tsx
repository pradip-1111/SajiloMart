
'use client';

import { useState, useEffect } from 'react';

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const calculateTimeLeft = (endDate: string): TimeLeft => {
  const difference = +new Date(endDate) - +new Date();
  let timeLeft: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  return timeLeft;
};

const TimeValue = ({ value, unit }: { value: number; unit: string }) => (
    <div className="flex flex-col items-center">
        <div className="text-4xl md:text-5xl font-bold text-gray-800 bg-white rounded-lg shadow-md w-20 h-20 flex items-center justify-center">
            {String(value).padStart(2, '0')}
        </div>
        <span className="mt-2 text-xs md:text-sm font-semibold uppercase tracking-wider text-white">
            {unit}
        </span>
    </div>
);


export default function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(endDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4">
      <TimeValue value={timeLeft.days} unit="Days" />
      <TimeValue value={timeLeft.hours} unit="Hours" />
      <TimeValue value={timeLeft.minutes} unit="Mins" />
      <TimeValue value={timeLeft.seconds} unit="Sec" />
    </div>
  );
}

    