#!/bin/sh
set -eu

{
  printf '%s\n' 'window.__APP_CONFIG__ = {'
  printf '  VITE_SUPABASE_URL: "%s",\n' "${VITE_SUPABASE_URL:-}"
  printf '  VITE_SUPABASE_ANON_KEY: "%s",\n' "${VITE_SUPABASE_ANON_KEY:-}"
  printf '%s\n' '};'
} > /usr/share/nginx/html/env-config.js