import re

input_file = "/home/conar/code/sous.tools/supabase/migrations/00000000000000_init_schema.sql"

with open(input_file, "r") as f:
    content = f.read()

# Add vendor columns if not present
if "customer_account_number" not in content:
    # We find the table vendors definition and insert the columns before created_at
    content = re.sub(
        r"(CREATE TABLE IF NOT EXISTS vendors \([\s\S]*?phone\s+TEXT,)",
        r"\1\n  customer_account_number TEXT,\n  terms TEXT,\n  route TEXT,\n  sales_rep TEXT,",
        content
    )

rls_statements = []
grant_statements = []

def extract_rls(match):
    rls_statements.append(match.group(0).strip())
    return ""

def extract_grant(match):
    grant_statements.append(match.group(0).strip())
    return ""

def extract_default_priv(match):
    grant_statements.append(match.group(0).strip())
    return ""

# Remove RLS and GRANTs
content = re.sub(r"^ALTER TABLE .*? (ENABLE|FORCE) ROW LEVEL SECURITY;\s*$", extract_rls, content, flags=re.MULTILINE)
content = re.sub(r"^\s*GRANT .*?;\s*$", extract_grant, content, flags=re.MULTILINE)
content = re.sub(r"^ALTER DEFAULT PRIVILEGES[\s\S]*?;\s*$", extract_default_priv, content, flags=re.MULTILINE)

# Remove the block comments that said "GRANT block"
content = re.sub(r"^-- 43\. GRANT block.*\n", "", content, flags=re.MULTILINE)
content = re.sub(r"^-- 44\. ALTER DEFAULT PRIVILEGES.*\n", "", content, flags=re.MULTILINE)

content = content.rstrip()

# Append RLS and GRANTs
content += "\n\n-- =============================================================================\n"
content += "-- ROW LEVEL SECURITY & GRANTS (MIGRATION FLATTENING)\n"
content += "-- =============================================================================\n"

# Deduplicate
rls_statements = list(dict.fromkeys(rls_statements))
grant_statements = list(dict.fromkeys(grant_statements))

for rls in rls_statements:
    content += rls + "\n"
content += "\n"
for grant in grant_statements:
    content += grant + "\n"

with open(input_file, "w") as f:
    f.write(content)

print("Flattening complete.")
