#!/bin/bash
export PGPASSWORD=postgres
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "SELECT conname FROM pg_constraint WHERE conrelid = 'vendors'::regclass;"
