
export interface CalendarEvent {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  organizer?: {
    name: string;
    email: string;
  };
  attendee?: {
    name?: string;
    email: string;
  };
}

export function generateICSContent(event: CalendarEvent): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const formatText = (text: string): string => {
    return text.replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  };

  const now = new Date();
  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@journalapp.com`;

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Journal App//Calendar Event//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatDate(now)}`,
    `DTSTART:${formatDate(event.startDate)}`,
    `DTEND:${formatDate(event.endDate)}`,
    `SUMMARY:${formatText(event.title)}`,
  ];

  if (event.description) {
    icsContent.push(`DESCRIPTION:${formatText(event.description)}`);
  }

  if (event.location) {
    icsContent.push(`LOCATION:${formatText(event.location)}`);
  }

  if (event.organizer) {
    icsContent.push(`ORGANIZER;CN=${event.organizer.name}:mailto:${event.organizer.email}`);
  }

  if (event.attendee) {
    const attendeeName = event.attendee.name || event.attendee.email;
    icsContent.push(`ATTENDEE;CN=${attendeeName};RSVP=TRUE:mailto:${event.attendee.email}`);
  }

  icsContent.push(
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  );

  return icsContent.join('\r\n');
}
