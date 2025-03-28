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

// netlify/functions/save-data.ts
var save_data_exports = {};
__export(save_data_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(save_data_exports);
var import_fs = require("fs");
var import_path = require("path");
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
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
    if (!event.body) {
      throw new Error("No data provided");
    }
    const { filename, data } = JSON.parse(event.body);
    if (!filename.match(/^[a-zA-Z0-9_-]+\.json$/)) {
      throw new Error("Invalid filename");
    }
    const allowedFiles = ["tags.json", "locations.json"];
    if (!allowedFiles.includes(filename)) {
      throw new Error("Unauthorized file access");
    }
    const filePath = (0, import_path.join)(__dirname, "data", filename);
    (0, import_fs.writeFileSync)(filePath, JSON.stringify(data, null, 2));
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      },
      body: JSON.stringify({ success: true })
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
//# sourceMappingURL=save-data.js.map
