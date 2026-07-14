const fs = require('fs');
const path = require('path');

// --- 1. AI RULES & STANDARDS ---
const cursorRules = fs.readFileSync(path.join(__dirname, '../.cursorrules'), 'utf-8');
fs.writeFileSync(
    path.join(__dirname, '../docs/context/notebooklm-rules.md'), 
    `# sous.tools AI System Rules\n\n${cursorRules}`
);

// --- 2. ARCHITECTURE GRAPH ---
const turboGraphRaw = fs.readFileSync(path.join(__dirname, '../docs/context/turbo-graph.json'), 'utf-8');
const turboGraph = JSON.parse(turboGraphRaw);
let graphText = "# Turborepo Architecture & Dependencies\n\n";
if(turboGraph.tasks) {
    turboGraph.tasks.forEach(task => {
        graphText += `- **${task.taskId}**: Depends on [${task.dependencies.join(', ')}]\n`;
    });
}
fs.writeFileSync(path.join(__dirname, '../docs/context/notebooklm-architecture.md'), graphText);

// --- 3. SPRINT STATE (GITHUB ISSUES) ---
const openIssues = fs.readFileSync(path.join(__dirname, '../docs/context/open-issues.txt'), 'utf-8');
fs.writeFileSync(
    path.join(__dirname, '../docs/context/notebooklm-issues.md'), 
    `# Open GitHub Issues & Sprint State\n\n${openIssues}`
);

// --- 4. QUALITY & TEST REPORTS ---
const reportsDir = path.join(__dirname, '../docs/reports');
let reportsText = "# Code Quality Gauntlet Reports\n\n";
if (fs.existsSync(reportsDir)) {
    const files = fs.readdirSync(reportsDir);
    files.forEach(file => {
        if (file.endsWith('.txt')) {
            const content = fs.readFileSync(path.join(reportsDir, file), 'utf-8');
            reportsText += `\n### ${file}\n\`\`\`text\n${content}\n\`\`\`\n`;
        }
    });
} else {
    reportsText += "No reports found.\n";
}
fs.writeFileSync(path.join(__dirname, '../docs/context/notebooklm-reports.md'), reportsText);

console.log("✅ Successfully generated 4 split NotebookLM context files.");