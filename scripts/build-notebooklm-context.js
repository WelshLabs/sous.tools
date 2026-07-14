const fs = require("fs");
const path = require("path");

// --- 1. AI RULES & STANDARDS ---
const cursorRules = fs.readFileSync(
  path.join(__dirname, "../.cursorrules"),
  "utf-8",
);
fs.writeFileSync(
  path.join(__dirname, "../docs/context/notebooklm-rules.md"),
  `# sous.tools AI System Rules\n\n${cursorRules}`,
);

// --- 2. WORKSPACE ARCHITECTURE (From pnpm ls) ---
try {
  const workspaceGraphRaw = fs.readFileSync(path.join(__dirname, '../docs/context/turbo-graph.json'), 'utf8');
  
  // pnpm ls outputs a raw array of packages, not an object with a 'tasks' property
  const workspaces = JSON.parse(workspaceGraphRaw); 
  
  let architectureText = "# sous.tools Workspace Architecture\n\n";
  
  workspaces.forEach(pkg => {
    // Attempt to split the absolute path so it just shows the relative repo path (e.g., apps/web)
    const relativePath = pkg.path.split('sous.tools/')[1] || pkg.path;
    
    architectureText += `### 📦 ${pkg.name}\n`;
    architectureText += `- **Location:** ${relativePath}\n`;
    architectureText += `- **Private:** ${pkg.private ? 'Yes' : 'No'}\n\n`;
  });

  fs.writeFileSync(path.join(__dirname, '../docs/context/notebooklm-architecture.md'), architectureText);
  console.log("✔ Successfully generated notebooklm-architecture.md");
} catch (error) {
  console.error("Error parsing workspace graph:", error.message);
}

// --- 3. SPRINT STATE (GITHUB ISSUES) ---
// const openIssues = fs.readFileSync(
//   path.join(__dirname, "../docs/context/open-issues.txt"),
//   "utf-8",
// );
// fs.writeFileSync(
//   path.join(__dirname, "../docs/context/notebooklm-issues.md"),
//   `# Open GitHub Issues & Sprint State\n\n${openIssues}`,
// );

// --- 4. QUALITY & TEST REPORTS ---
// GitHub preserves the directory structure, so we look inside the nested quality-reports folder
const reportsDir = path.join(__dirname, "../docs/reports/quality-reports");
let reportsText = "# Code Quality Gauntlet Reports\n\n";

if (fs.existsSync(reportsDir)) {
  const files = fs.readdirSync(reportsDir);
  files.forEach((file) => {
    if (file.endsWith(".txt")) {
      const content = fs.readFileSync(path.join(reportsDir, file), "utf-8");
      reportsText += `\n### ${file}\n\`\`\`text\n${content}\n\`\`\`\n`;
    }
  });
} else {
  reportsText += "No reports found.\n";
}
fs.writeFileSync(
  path.join(__dirname, "../docs/context/notebooklm-reports.md"),
  reportsText,
);

console.log("✅ Successfully generated 4 split NotebookLM context files.");
