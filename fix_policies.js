const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'supabase/migrations');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find all CREATE POLICY statements
  // e.g. CREATE POLICY "Enable read access for all organization members" ON signage_layouts
  const regex = /CREATE POLICY\s+"([^"]+)"\s+ON\s+([a-zA-Z0-9_]+)/g;
  
  content = content.replace(regex, (match, policyName, tableName) => {
    return `DROP POLICY IF EXISTS "${policyName}" ON ${tableName};\n${match}`;
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
}
