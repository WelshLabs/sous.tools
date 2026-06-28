const http = require('http');

const req = http.request('http://localhost:3000/api/ingestion/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', data));
});

req.on('error', console.error);
req.write(JSON.stringify({
  organizationId: "d0000000-0000-0000-0000-000000000000",
  userId: "e0000000-0000-0000-0000-000000000000", // Fake UUID
  source: "google_drive",
  documentType: "recipe",
  fileIds: ["123"]
}));
req.end();
