'use client';

import React, { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const years = Array.from({ length: 50 }, (_, i) => (new Date().getFullYear() - i).toString());

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange }) => {
  const [startMonth, setStartMonth] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [endYear, setEndYear] = useState("");
  const [isPresent, setIsPresent] = useState(false);

  useEffect(() => {
    if (value) {
      // Parse "Jan 2020 - Present" or "Jan 2020 - Dec 2022"
      const parts = value.split(" - ");
      if (parts.length > 0) {
        const start = parts[0].split(" ");
        if (start.length === 2) {
          setStartMonth(start[0]);
          setStartYear(start[1]);
        }
      }
      if (parts.length > 1) {
        if (parts[1] === "Present") {
          setIsPresent(true);
          setEndMonth("");
          setEndYear("");
        } else {
          setIsPresent(false);
          const end = parts[1].split(" ");
          if (end.length === 2) {
            setEndMonth(end[0]);
            setEndYear(end[1]);
          }
        }
      }
    }
  }, [value]);

  const updateDate = (sMonth: string, sYear: string, eMonth: string, eYear: string, present: boolean) => {
    let dateString = "";
    if (sMonth && sYear) {
      dateString += `${sMonth} ${sYear}`;
      if (present) {
        dateString += " - Present";
      } else if (eMonth && eYear) {
        dateString += ` - ${eMonth} ${eYear}`;
      }
    }
    onChange(dateString);
  };

  const handleStartMonthChange = (v: string) => {
    setStartMonth(v);
    updateDate(v, startYear, endMonth, endYear, isPresent);
  };

  const handleStartYearChange = (v: string) => {
    setStartYear(v);
    updateDate(startMonth, v, endMonth, endYear, isPresent);
  };

  const handleEndMonthChange = (v: string) => {
    setEndMonth(v);
    updateDate(startMonth, startYear, v, endYear, isPresent);
  };

  const handleEndYearChange = (v: string) => {
    setEndYear(v);
    updateDate(startMonth, startYear, endMonth, v, isPresent);
  };

  const handlePresentChange = (checked: boolean) => {
    setIsPresent(checked);
    updateDate(startMonth, startYear, endMonth, endYear, checked);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="grid grid-cols-2 gap-2 flex-1">
          <Select value={startMonth} onValueChange={handleStartMonthChange}>
            <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
            <SelectContent>
              {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={startYear} onValueChange={handleStartYearChange}>
            <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
            <SelectContent>
              {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <span className="text-gray-500">-</span>
        <div className="grid grid-cols-2 gap-2 flex-1">
          <Select value={endMonth} onValueChange={handleEndMonthChange} disabled={isPresent}>
            <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
            <SelectContent>
              {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={endYear} onValueChange={handleEndYearChange} disabled={isPresent}>
            <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
            <SelectContent>
              {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="present" checked={isPresent} onCheckedChange={handlePresentChange} />
        <Label htmlFor="present">Currently work here</Label>
      </div>
    </div>
  );
};

export default DatePicker;
