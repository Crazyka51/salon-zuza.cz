'use client';

import React from 'react';
import { CalendarView, ReservationForm } from '../../admin-kit/ui/Calendar';
import { useState } from 'react';

export default function TestCalendarPage() {
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');

  const handleDateSelect = (date: Date) => {
    console.log('Vybráno datum:', date);
    setSelectedDate(date);
  };

  const handleReservationClick = (rezervace: any) => {
    console.log('Kliknuto na rezervaci:', rezervace);
  };

  const handleCreateReservation = (date: Date, time: string) => {
    console.log('Vytvoření rezervace:', date, time);
    setSelectedDate(date);
    setSelectedTime(time);
    setShowReservationForm(true);
  };

  const handleReservationSuccess = () => {
    console.log('Rezervace vytvořena úspěšně');
    setShowReservationForm(false);
    // Aktualizovat kalendář by se měl automaticky
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Test Kalendář Rezervací</h1>
        
        <div className="mb-4 space-x-4">
          <button
            onClick={() => setShowReservationForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Nová rezervace
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            Obnovit
          </button>
        </div>

        <CalendarView
          onDateSelect={handleDateSelect}
          onReservationClick={handleReservationClick}
          onCreateReservation={handleCreateReservation}
          selectedDate={selectedDate}
        />

        <ReservationForm
          isOpen={showReservationForm}
          onClose={() => setShowReservationForm(false)}
          onSuccess={handleReservationSuccess}
          preselectedDate={selectedDate}
          preselectedTime={selectedTime}
        />
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Debug Info:</h3>
        <p className="text-gray-700 dark:text-gray-300">Vybrané datum: {selectedDate.toLocaleDateString('cs-CZ')}</p>
        <p className="text-gray-700 dark:text-gray-300">Vybraný čas: {selectedTime || 'není'}</p>
        <p className="text-gray-700 dark:text-gray-300">Formulář otevřen: {showReservationForm ? 'ano' : 'ne'}</p>
      </div>
    </div>
  );
}