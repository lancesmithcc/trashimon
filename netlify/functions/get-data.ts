import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { join } from "https://deno.land/std@0.168.0/path/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const defaultData = {
  tags: {
    tags: [
      { keyword: "mcdonalds", color: "#FF0000", count: 0 },
      { keyword: "beer cans", color: "#FFD700", count: 0 },
      { keyword: "plastic bottles", color: "#00FF00", count: 0 },
      { keyword: "cigarette butts", color: "#808080", count: 0 },
      { keyword: "food wrappers", color: "#FFA500", count: 0 }
    ]
  },
  locations: {
    locations: []
  }
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const url = new URL(req.url);
    const filename = url.searchParams.get("filename");

    if (!filename) {
      throw new Error("No filename provided");
    }

    if (!filename.match(/^[a-zA-Z0-9_-]+\.json$/)) {
      throw new Error("Invalid filename");
    }

    const allowedFiles = ["tags.json", "locations.json"];
    if (!allowedFiles.includes(filename)) {
      throw new Error("Unauthorized file access");
    }

    // Return default data based on filename
    const key = filename.replace('.json', '') as keyof typeof defaultData;
    return new Response(JSON.stringify(defaultData[key]), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
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