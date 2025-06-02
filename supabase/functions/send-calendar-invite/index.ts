
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CalendarInviteRequest {
  to: string;
  toName?: string;
  event: {
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    location?: string;
  };
  organizerName: string;
  organizerEmail: string;
}

function generateICSContent(event: any, organizer: any, attendee: any): string {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
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
    `DTSTAMP:${formatDate(now.toISOString())}`,
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

  icsContent.push(`ORGANIZER;CN=${organizer.name}:mailto:${organizer.email}`);
  
  const attendeeName = attendee.name || attendee.email;
  icsContent.push(`ATTENDEE;CN=${attendeeName};RSVP=TRUE:mailto:${attendee.email}`);

  icsContent.push(
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  );

  return icsContent.join('\r\n');
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, toName, event, organizerName, organizerEmail }: CalendarInviteRequest = await req.json();

    console.log('Sending calendar invite to:', to);
    console.log('Event details:', event);

    // Generate ICS content
    const icsContent = generateICSContent(
      event,
      { name: organizerName, email: organizerEmail },
      { name: toName, email: to }
    );

    // Create ICS attachment
    const icsBuffer = new TextEncoder().encode(icsContent);
    const icsBase64 = btoa(String.fromCharCode(...icsBuffer));

    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const formatTime = (date: Date) => date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    const emailResponse = await resend.emails.send({
      from: `${organizerName} <onboarding@resend.dev>`,
      to: [to],
      subject: `Calendar Invite: ${event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">
            📅 You're Invited!
          </h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #4f46e5; margin-top: 0;">${event.title}</h3>
            
            <div style="margin: 15px 0;">
              <strong>📅 When:</strong><br>
              <span style="color: #666;">Start: ${formatTime(startDate)}</span><br>
              <span style="color: #666;">End: ${formatTime(endDate)}</span>
            </div>
            
            ${event.location ? `
              <div style="margin: 15px 0;">
                <strong>📍 Where:</strong><br>
                <span style="color: #666;">${event.location}</span>
              </div>
            ` : ''}
            
            ${event.description ? `
              <div style="margin: 15px 0;">
                <strong>📝 Details:</strong><br>
                <span style="color: #666;">${event.description}</span>
              </div>
            ` : ''}
            
            <div style="margin: 15px 0;">
              <strong>👤 Organizer:</strong><br>
              <span style="color: #666;">${organizerName} (${organizerEmail})</span>
            </div>
          </div>
          
          <div style="background-color: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #0277bd;">
              <strong>📎 Calendar file attached!</strong><br>
              Click on the attachment to add this event to your calendar app (Google Calendar, Outlook, Apple Calendar, etc.)
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666; font-size: 14px;">
              This invitation was sent from your Journal App
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`,
          content: icsBase64,
          content_type: 'text/calendar',
        },
      ],
    });

    console.log("Calendar invite sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending calendar invite:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to send calendar invite' 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
