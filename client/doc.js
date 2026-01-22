import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToInclude = [
  "index.html",
  "src/App.jsx",
  "src/main.jsx",
  "src/components/Register.jsx",
  "src/components/Navbar.jsx",
  "src/components/Login.jsx",
  "src/components/Home.jsx",
  "src/components/Dashboard.jsx",
  "package.json"
];


let output = "";

for (const file of filesToInclude) {
  const filePath = path.join(__dirname, file);

  if (fs.existsSync(filePath)) {
    output += `
=========================
FILE: ${file}
=========================
`;
    output += fs.readFileSync(filePath, "utf8");
    output += "\n";
  } else {
    console.log(`Skipped (not found): ${file}`);
  }
}

fs.writeFileSync("project-code.txt", output);
console.log("✅ project-code.txt created");
