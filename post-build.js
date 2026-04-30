import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, "dist");

// Create _redirects file
const redirectsContent = "/* /Birthday/index.html 200\n";
fs.writeFileSync(path.join(distDir, "_redirects"), redirectsContent);

// Create _headers file
const headersContent = "/*\n  X-Content-Type-Options: nosniff\n";
fs.writeFileSync(path.join(distDir, "_headers"), headersContent);

console.log("Created _redirects and _headers files in dist/");
