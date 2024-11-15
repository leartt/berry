'use client';

import * as React from 'react';
import { format, parse, set } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

interface Props {
  date: Date | undefined;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  className?: string;
}

export default function DateTimePicker({ className, date, setDate }: Props) {
  const [open, setOpen] = useState(false);
  console.log(date);
  const setDateTime = (
    newDate: Date | undefined,
    hour: number,
    minute: number
  ) => {
    if (newDate) {
      const updatedDate = set(newDate, {
        hours: hour,
        minutes: minute,
        seconds: 0,
        milliseconds: 0,
      });
      setDate(updatedDate);
    } else {
      setDate(undefined);
    }
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const currentHour = date ? date.getHours() : 0;
      const currentMinute = date ? date.getMinutes() : 0;
      setDateTime(selectedDate, currentHour, currentMinute);
    } else {
      setDate(undefined);
    }
  };

  const handleHourChange = (value: string) => {
    if (date) {
      const hour = parseInt(value, 10);
      setDateTime(date, hour, date.getMinutes());
    }
  };

  const handleMinuteChange = (value: string) => {
    if (date) {
      const minute = parseInt(value, 10);
      setDateTime(date, date.getHours(), minute);
    }
  };

  const handlePeriodChange = (value: 'AM' | 'PM') => {
    if (date) {
      let hour = date.getHours();
      if (value === 'PM' && hour < 12) {
        hour += 12;
      } else if (value === 'AM' && hour >= 12) {
        hour -= 12;
      }
      setDateTime(date, hour, date.getMinutes());
    }
  };

  const formatDateTime = () => {
    if (!date) return 'Pick a date and time';
    return format(date, 'PPP p');
  };

  const getHour = () => {
    if (!date) return '12';
    const hour = date.getHours() % 12;
    return hour === 0 ? '12' : hour.toString().padStart(2, '0');
  };

  const getMinute = () => {
    return date ? date.getMinutes().toString().padStart(2, '0') : '00';
  };

  const getPeriod = () => {
    return date ? (date.getHours() >= 12 ? 'PM' : 'AM') : 'AM';
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover modal={true} open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'justify-start text-left relative',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateTime()}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
          <div className="border-t p-3 flex justify-between items-center">
            <Select value={getHour()} onValueChange={handleHourChange}>
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder="Hour" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                  <SelectItem
                    key={hour}
                    value={hour.toString().padStart(2, '0')}
                  >
                    {hour.toString().padStart(2, '0')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>:</span>
            <Select value={getMinute()} onValueChange={handleMinuteChange}>
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder="Minute" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                  <SelectItem
                    key={minute}
                    value={minute.toString().padStart(2, '0')}
                  >
                    {minute.toString().padStart(2, '0')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={getPeriod()} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder="AM/PM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
