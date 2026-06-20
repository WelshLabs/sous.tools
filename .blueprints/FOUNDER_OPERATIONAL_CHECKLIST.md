# 📋 MANUAL FOUNDER OPERATIONAL CHECKLIST
(Tasks you must execute manually outside the AI's purview)

## 1. HARDWARE APPLIANCE PROVISIONING (Raspberry Pi)
* [ ] Trigger the automated build-signage-image.sh script via GitHub Actions CI/CD to build your .img.xz custom OS.
* [ ] Open Raspberry Pi Imager. Select "Use Custom", select the output .img.xz file, and flash your target SD card.
* [ ] Insert SD card into Pi 5, plug in HDMI-A-1 and HDMI-A-2, attach network, and power on. Verify auto-login, Infisical secret hydration, and Wayland kiosk launch.

## 2. OBSERVABILITY PLATFORM (Better Stack)
* [ ] Register a free account at betterstack.com.
* [ ] UPTIME: Create an HTTP monitor targeting https://api.sous.tools/health with a 5-minute polling interval to bypass Render's sleep timer.
* [ ] HEARTBEAT: Create an Uptime Heartbeat track. Add the URL to your Infisical secrets so sync-watchtower.js can ping it 24/7.
* [ ] LOGS: Copy the Syslog TLS integration endpoint token. Save it as a "Log Stream" destination inside Render. Link Vercel logs via native integration.

## 3. DEVELOPER ACCOUNT ONBOARDING
* [ ] Toast POS: Visit the Toast Developer portal. Submit a Partner application for sous.tools (Restaurant OS) to acquire sandbox API access.
* [ ] D-U-N-S Number: Submit legal entity filings to Dun & Bradstreet (takes ~7 days).
* [ ] Apple Developer: Create a corporate Apple ID. Enroll as an "Organization Account" using your D-U-N-S identifier ($99/year).
* [ ] Google Play Console: Setup an Organization developer handle. Submit D-U-N-S entry to bypass the 20-user beta restriction ($25 fee).
