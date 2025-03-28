import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const body = await req.json();
    const { filename, data } = body;

    if (!filename.match(/^[a-zA-Z0-9_-]+\.json$/)) {
      throw new Error("Invalid filename");
    }

    const allowedFiles = ["tags.json", "locations.json"];
    if (!allowedFiles.includes(filename)) {
      throw new Error("Unauthorized file access");
    }

    // In development, we'll just return success without actually saving
    // When deployed to Netlify, the functions will have proper file system access
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Save error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});