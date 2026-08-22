import { io } from "socket.io-client";
// @ts-ignore
import mdns from "mdns-js";
// @ts-ignore
import escpos from "escpos";
// @ts-ignore
import escposNetwork from "escpos-network";

escpos.Network = escposNetwork;

const API_URL = process.env.API_URL || "http://localhost:3000";
const EDGE_TOKEN = process.env.EDGE_TOKEN;

if (!EDGE_TOKEN) {
  console.error("Missing EDGE_TOKEN in environment.");
  process.exit(1);
}

const socket = io(`${API_URL}/edge`, {
  auth: { token: EDGE_TOKEN },
});

socket.on("connect", () => {
  console.log("Edge node connected to central cloud.");
});

// Printer Discovery
const browser = mdns.createBrowser(mdns.tcp("printer"));
const discoveredPrinters = new Map<string, any>();

browser.on("ready", () => {
  browser.discover();
});

browser.on("update", (data: any) => {
  const ip = data.addresses?.[0];
  if (ip && !discoveredPrinters.has(ip)) {
    console.log(`Discovered ESC/POS printer at ${ip}`);
    discoveredPrinters.set(ip, data);
    socket.emit("printer_discovered", { ip, name: data.host });
  }
});

// Handle print jobs
socket.on(
  "print_job",
  (job: { ip: string; type: "receipt" | "kds"; lines: string[] }) => {
    console.log(`Received print job for ${job.ip}`);

    const device = new escpos.Network(job.ip, 9100);
    const printer = new escpos.Printer(device);

    device.open((err: Error | null) => {
      if (err) {
        console.error(`Printer connection failed: ${job.ip}`, err);
        socket.emit("print_job_failed", { ip: job.ip, error: err.message });
        return;
      }

      printer.font("a").align("ct").style("b");

      job.lines.forEach((line) => {
        printer.text(line);
      });

      printer.cut().close();

      socket.emit("print_job_success", { ip: job.ip });
    });
  },
);
