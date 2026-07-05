#!/bin/bash
# kiosk.sh - Single screen setup portal launcher
export XDG_RUNTIME_DIR=/run/user/1000

labwc -s "chromium-browser --kiosk --start-maximized --disable-infobars --no-first-run 'http://localhost:3000'"
