'use client';

import { useState } from 'react';
import { Calendar, Clock, Save } from 'lucide-react';

interface SchedulePublishingProps {
  published: boolean
  publishedAt?: string
  onScheduleChange: (scheduled: boolean, publishedAt?: string, publishNow?: boolean) => void
}

export default function SchedulePublishing({ published, publishedAt, onScheduleChange }: SchedulePublishingProps) {
  const [isScheduled, setIsScheduled] = useState(!!publishedAt && !published);
  const [scheduleDate, setScheduleDate] = useState(
    publishedAt ? new Date(publishedAt).toISOString().slice(0, 16) : ''
  );

  const handleScheduleToggle = (scheduled: boolean) => {
    setIsScheduled(scheduled);
    
    if (scheduled && scheduleDate) {
      onScheduleChange(true, scheduleDate, false);
    } else {
      onScheduleChange(false, undefined, false);
    }
  };

  const handleDateChange = (date: string) => {
    setScheduleDate(date);
    if (isScheduled) {
      onScheduleChange(true, date, false);
    }
  };

  const formatScheduledDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isDateInPast = scheduleDate && new Date(scheduleDate) < new Date();

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-medium text-gray-900">Plánované publikování</h3>
      </div>

      <div className="space-y-4">
        {/* Publishing options */}
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="radio"
              name="publishing"
              checked={published && !isScheduled}
              onChange={() => {
                setIsScheduled(false);
                onScheduleChange(false, undefined, true); // true = publish immediately
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-900">Publikovat okamžitě</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              name="publishing"
              checked={!published && !isScheduled}
              onChange={() => {
                setIsScheduled(false);
                onScheduleChange(false, undefined, false); // false = save as draft
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-900">Uložit jako koncept</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              name="publishing"
              checked={isScheduled}
              onChange={() => handleScheduleToggle(true)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-900">Naplánovat publikování</span>
          </label>
        </div>

        {/* Schedule date/time picker */}
        {isScheduled && (
          <div className="ml-6 space-y-3">
            <div>
              <label htmlFor="schedule-date" className="block text-sm font-medium text-gray-700 mb-1">
                Datum a čas publikování
              </label>
              <input
                id="schedule-date"
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => handleDateChange(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  isDateInPast ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {isDateInPast && (
                <p className="text-sm text-red-600 mt-1">
                  Datum nemůže být v minulosti
                </p>
              )}
            </div>

            {scheduleDate && !isDateInPast && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Naplánováno na: {formatScheduledDate(scheduleDate)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Current status info */}
        <div className="pt-3 border-t">
          <div className="text-sm text-gray-600">
            <strong>Aktuální stav:</strong>
            {published && (
              <span className="ml-1 text-green-600">Publikováno</span>
            )}
            {!published && !isScheduled && (
              <span className="ml-1 text-yellow-600">Koncept</span>
            )}
            {isScheduled && scheduleDate && !isDateInPast && (
              <span className="ml-1 text-blue-600">
                Naplánováno na {formatScheduledDate(scheduleDate)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
