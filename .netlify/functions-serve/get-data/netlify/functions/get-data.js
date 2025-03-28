var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// netlify/functions/get-data.ts
var get_data_exports = {};
__export(get_data_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(get_data_exports);
var import_fs = require("fs");
var import_path = require("path");
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, OPTIONS"
};
var defaultData = {
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
var handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ""
    };
  }
  try {
    const filename = event.queryStringParameters?.filename;
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
    const filePath = (0, import_path.join)(__dirname, "data", filename);
    let data;
    try {
      const fileContent = (0, import_fs.readFileSync)(filePath, "utf-8");
      data = JSON.parse(fileContent);
    } catch (err) {
      const key = filename.replace(".json", "");
      data = defaultData[key];
    }
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      },
      body: JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=get-data.js.map
