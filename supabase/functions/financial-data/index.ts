
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get ticker from request body instead of query parameter
    const { ticker } = await req.json();

    if (!ticker) {
      return new Response(
        JSON.stringify({ error: 'Ticker parameter is required in request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Fetching financial data for ticker: ${ticker}`);

    const apiUrl = `https://api.financialdatasets.ai/financial-metrics/snapshot?ticker=${ticker}`;
    const options = {
      method: 'GET',
      headers: {
        'X-API-KEY': '51f2f44d-fa55-4334-87a8-754b6f8c2266',
        'Content-Type': 'application/json'
      }
    };

    const response = await fetch(apiUrl, options);
    
    if (!response.ok) {
      console.error(`API request failed with status ${response.status}: ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      
      return new Response(
        JSON.stringify({ 
          error: `API request failed with status ${response.status}: ${response.statusText}` 
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));

    // Extract the snapshot data from the nested structure
    const snapshotData = data.snapshot || data;
    console.log('Snapshot data:', JSON.stringify(snapshotData, null, 2));

    // Return the snapshot data directly
    return new Response(JSON.stringify(snapshotData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in financial-data function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});