'use client';

import * as React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TaskDetailData } from '@/features/tasks/TaskDetailModal';

interface CalendarViewProps {
  tasks: TaskDetailData[];
  onSelectTask: (task: TaskDetailData) => void;
}

export function CalendarView({ tasks, onSelectTask }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  // Compute month calendar days
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays: { dayNumber: number; isCurrentMonth: boolean; dateStr: string }[] = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const d = new Date(year, month - 1, day);
    calendarDays.push({
      dayNumber: day,
      isCurrentMonth: false,
      dateStr: d.toISOString().split('T')[0],
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    calendarDays.push({
      dayNumber: day,
      isCurrentMonth: true,
      dateStr: d.toISOString().split('T')[0],
    });
  }

  // Next month leading days to complete grid (up to 35 or 42)
  const remaining = (7 - (calendarDays.length % 7)) % 7;
  for (let day = 1; day <= remaining; day++) {
    const d = new Date(year, month + 1, day);
    calendarDays.push({
      dayNumber: day,
      isCurrentMonth: false,
      dateStr: d.toISOString().split('T')[0],
    });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between bg-card/60 p-3 rounded-xl border border-border">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={today} className="h-8 text-xs px-2.5">
            Today
          </Button>
          <Button variant="outline" size="icon-sm" onClick={prevMonth} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={nextMonth} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Month Grid */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        {/* Day of week labels */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/30 text-center text-[11px] font-semibold text-muted-foreground py-2 select-none">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-border/60">
          {calendarDays.map((calDay, idx) => {
            const isToday = calDay.dateStr === todayStr;
            const dayTasks = tasks.filter((t) => {
              if (!t.due_date) return false;
              return t.due_date.startsWith(calDay.dateStr);
            });

            return (
              <div
                key={idx}
                className={`min-h-[105px] p-1.5 transition-colors flex flex-col ${
                  !calDay.isCurrentMonth
                    ? 'bg-muted/10 opacity-40'
                    : isToday
                    ? 'bg-primary/5'
                    : 'hover:bg-muted/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1 px-1">
                  <span
                    className={`h-5 w-5 rounded-full flex items-center justify-center text-[11px] font-semibold ${
                      isToday
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'text-foreground'
                    }`}
                  >
                    {calDay.dayNumber}
                  </span>

                  {dayTasks.length > 0 && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                  )}
                </div>

                {/* Tasks for this day */}
                <div className="space-y-1 flex-1 overflow-y-auto max-h-[80px]">
                  {dayTasks.map((t) => {
                    const isOverdue = !t.is_completed && t.due_date && t.due_date < todayStr;
                    return (
                      <div
                        key={t.id}
                        onClick={() => onSelectTask(t)}
                        className={`group flex items-center justify-between gap-1 p-1 rounded border text-[10px] cursor-pointer transition-all hover:border-primary ${
                          t.is_completed
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : isOverdue
                            ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
                            : 'bg-card border-border/70 text-foreground hover:bg-muted'
                        }`}
                        title={`${t.title} (${t.status})`}
                      >
                        <span className={`truncate flex-1 font-medium ${t.is_completed ? 'line-through opacity-70' : ''}`}>
                          {t.title}
                        </span>

                        {isOverdue && (
                          <AlertCircle className="h-3 w-3 shrink-0 text-red-500" />
                        )}
                        {t.is_completed && (
                          <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
