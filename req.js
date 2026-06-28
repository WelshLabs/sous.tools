fetch("http://localhost:3001/ingestion/submit", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    organizationId: "d0000000-0000-0000-0000-000000000000",
    userId: "test",
    source: "google_drive",
    documentType: "recipe",
    fileIds: ["123"]
  })
}).then(async res => {
  console.log(res.status, await res.text());
}).catch(console.error);
