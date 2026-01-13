import React, { useState, useEffect } from 'react';
import { FC } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, isSameDay, parseISO, addMonths, subMonths } from 'date-fns';
import { Calendar, Clock, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/services/api';
import { useUser } from '@/contexts/UserContext';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'deadline' | 'followup' | 'reminder' | 'report';
  reportType: 'red-flag' | 'intervention';
  status: string;
  priority: 'low' | 'medium' | 'high';
}

export default function CalendarView() {
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [reminders, setReminders] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    if (user) {
      loadCalendarData();
    }
  }, [user]);

  useEffect(() => {
    console.log('Selected date changed:', selectedDate);
  }, [selectedDate]);

  const loadCalendarData = async () => {
    setLoading(true);
    try {
      const [redFlagsRes, interventionsRes] = await Promise.all([
        api.getRedFlags(),
        api.getInterventions(),
      ]);

      const userRedFlags = (redFlagsRes.data || []).filter(
        (r: any) => r.user_id.toString() === user?.id
      );
      const userInterventions = (interventionsRes.data || []).filter(
        (r: any) => r.user_id.toString() === user?.id
      );

      const allReports = [...userRedFlags, ...userInterventions];
      const calendarEvents: CalendarEvent[] = [];

      console.log('Loading calendar data for user:', user?.id);
      console.log('User reports:', allReports.length);

      allReports.forEach((report: any) => {
        console.log('Processing report:', report.id, report.status, report.title, 'created_at:', report.created_at);

        // Parse creation date more robustly
        let createdDate: Date;
        try {
          if (report.created_at) {
            // Handle different date formats
            if (typeof report.created_at === 'string') {
              createdDate = parseISO(report.created_at);
            } else {
              createdDate = new Date(report.created_at);
            }
          } else if (report.createdAt) {
            createdDate = new Date(report.createdAt);
          } else {
            console.warn('No creation date found for report:', report.id);
            return; // Skip this report
          }

          // Validate the date
          if (isNaN(createdDate.getTime())) {
            console.warn('Invalid date for report:', report.id, report.created_at);
            return;
          }

          console.log('Parsed date for report:', report.title, 'Date:', createdDate.toISOString());

          calendarEvents.push({
            id: `reminder-${report.id}`,
            title: `Reminder: ${report.title}`,
            date: createdDate,
            type: 'reminder',
            reportType: report.type === 'red-flag' ? 'red-flag' : 'intervention',
            status: report.status,
            priority: report.status === 'DRAFT' ? 'low' : report.status === 'UNDER INVESTIGATION' ? 'high' : 'medium'
          });

          console.log('Added reminder for:', report.title, 'on:', createdDate.toDateString());
        } catch (error) {
          console.error('Error parsing date for report:', report.id, error);
        }
      });

      console.log('Total calendar events created:', calendarEvents.length);
      setEvents(calendarEvents);

      // Load reminders from localStorage
      const savedReminders = localStorage.getItem('calendarReminders');
      if (savedReminders) {
        setReminders(JSON.parse(savedReminders));
      }
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventsForDate = (date: Date) => {
    const filteredEvents = events.filter(event => isSameDay(event.date, date));
    console.log('Getting events for date:', date, 'Found events:', filteredEvents.length);
    return filteredEvents;
  };

  const handleDateSelect = (date: Date | undefined) => {
    console.log('Date selected:', date);
    setSelectedDate(date);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentMonth(prev => subMonths(prev, 1));
    } else {
      setCurrentMonth(prev => addMonths(prev, 1));
    }
  };

  const goToMonth = (monthIndex: number) => {
    const newDate = new Date(currentMonth.getFullYear(), monthIndex, 1);
    setCurrentMonth(newDate);
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return <AlertTriangle size={16} className="text-red-500" />;
      case 'followup':
        return <Clock size={16} className="text-blue-500" />;
      case 'reminder':
        return <CheckCircle size={16} className="text-green-500" />;
      default:
        return <Calendar size={16} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const modifiers = {
    hasEvents: events.map(event => event.date),
  };

  const modifiersStyles = {
    hasEvents: {
      backgroundColor: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
      fontWeight: 'bold',
    },
  };

  return (
    <div className="calendar-view">
      <div className="flex gap-6">
        {/* Calendar */}
        <div className="flex-1">
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Report Calendar
            </h3>
            {/* Custom Month Navigation */}
            <div className="flex items-center justify-between mb-4 p-2 bg-muted rounded-lg">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-1 hover:bg-background rounded transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex items-center gap-2">
                <select
                  value={currentMonth.getMonth()}
                  onChange={(e) => goToMonth(parseInt(e.target.value))}
                  className="bg-transparent border-none outline-none font-semibold cursor-pointer hover:bg-background px-2 py-1 rounded transition-colors"
                >
                  {months.map((month, index) => (
                    <option key={month} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
                <span className="font-semibold">{currentMonth.getFullYear()}</span>
              </div>

              <button
                onClick={() => navigateMonth('next')}
                className="p-1 hover:bg-background rounded transition-colors"
                aria-label="Next month"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="calendar-picker"
              showOutsideDays={false}
            />
          </div>
        </div>

        {/* Events for selected date */}
        <div className="w-80">
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
            </h3>

            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : (
              <div className="space-y-3">
                {selectedDate && getEventsForDate(selectedDate).length > 0 ? (
                  getEventsForDate(selectedDate).map((event) => (
                    <div
                      key={event.id}
                      className={`p-3 border rounded-lg ${getPriorityColor(event.priority)}`}
                    >
                      <div className="flex items-start gap-2">
                        {getEventIcon(event.type)}
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {event.reportType === 'red-flag' ? 'Red Flag' : 'Intervention'} • {event.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No events for this date
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Upcoming Reminders */}
          <div className="bg-card border border-border rounded-lg p-4 mt-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock size={20} />
              Upcoming Reminders
            </h3>
            <div className="space-y-2">
              {events
                .filter(event => event.type === 'reminder' && event.date >= new Date())
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .slice(0, 3)
                .map((reminder) => (
                  <div key={reminder.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <CheckCircle size={14} className="text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{reminder.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(reminder.date, 'MMM d')}
                      </p>
                    </div>
                  </div>
                ))}
              {events.filter(event => event.type === 'reminder' && event.date >= new Date()).length === 0 && (
                <div className="text-center py-2 text-muted-foreground text-sm">
                  No upcoming reminders
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
