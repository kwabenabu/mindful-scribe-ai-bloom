
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface CalendarEvent {
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, authCode, eventData, refreshToken } = await req.json();
    console.log('Google Calendar sync action:', action);

    if (action === 'auth') {
      // Exchange authorization code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code: authCode,
          client_id: Deno.env.get('GOOGLE_CLIENT_ID') ?? '',
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '',
          redirect_uri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-calendar-sync`,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Token exchange failed:', errorText);
        throw new Error(`Token exchange failed: ${errorText}`);
      }

      const tokenData: GoogleTokenResponse = await tokenResponse.json();
      console.log('Successfully obtained Google tokens');

      return new Response(
        JSON.stringify({
          success: true,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresIn: tokenData.expires_in,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (action === 'create_event') {
      // Create event in Google Calendar
      const { access_token, event } = eventData;

      // Format event for Google Calendar API
      const googleEvent: CalendarEvent = {
        summary: event.event_title,
        description: event.event_description || '',
        location: event.location || '',
        start: {},
        end: {},
      };

      // Handle datetime vs date-only events
      if (event.event_datetime) {
        const startTime = new Date(event.event_datetime);
        const endTime = new Date(startTime.getTime() + (event.duration_minutes || 30) * 60000);
        
        googleEvent.start.dateTime = startTime.toISOString();
        googleEvent.end.dateTime = endTime.toISOString();
        googleEvent.start.timeZone = event.timezone || 'UTC';
        googleEvent.end.timeZone = event.timezone || 'UTC';
      } else if (event.event_date) {
        googleEvent.start.date = event.event_date;
        googleEvent.end.date = event.event_date;
      } else {
        // Default to today if no date specified
        const today = new Date().toISOString().split('T')[0];
        googleEvent.start.date = today;
        googleEvent.end.date = today;
      }

      console.log('Creating Google Calendar event:', googleEvent);

      const calendarResponse = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(googleEvent),
        }
      );

      if (!calendarResponse.ok) {
        const errorText = await calendarResponse.text();
        console.error('Calendar event creation failed:', errorText);
        throw new Error(`Calendar event creation failed: ${errorText}`);
      }

      const createdEvent = await calendarResponse.json();
      console.log('Successfully created Google Calendar event:', createdEvent.id);

      // Update the detected event with the Google Calendar event ID
      const { error: updateError } = await supabase
        .from('detected_events')
        .update({
          external_event_id: createdEvent.id,
          calendar_provider: 'google',
          status: 'synced'
        })
        .eq('id', event.id);

      if (updateError) {
        console.error('Failed to update detected event:', updateError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          eventId: createdEvent.id,
          eventUrl: createdEvent.htmlLink,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (action === 'refresh_token') {
      // Refresh the access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID') ?? '',
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '',
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Token refresh failed:', errorText);
        throw new Error(`Token refresh failed: ${errorText}`);
      }

      const tokenData: GoogleTokenResponse = await tokenResponse.json();
      console.log('Successfully refreshed Google token');

      return new Response(
        JSON.stringify({
          success: true,
          accessToken: tokenData.access_token,
          expiresIn: tokenData.expires_in,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    throw new Error('Invalid action specified');

  } catch (error) {
    console.error('Google Calendar sync error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
