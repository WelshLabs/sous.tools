const jwt = require("jsonwebtoken");
const token = jwt.sign(
  { role: "service_role", iss: "supabase" },
  "super-secret-jwt-token-with-at-least-32-characters-long"
);
console.log(token);
