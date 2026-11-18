#!/usr/bin/env bash
# Credential-free Supabase session-pooler trust verification.
# Never use sslmode=disable, rejectUnauthorized=false, or trust-on-first-use.
set -euo pipefail
umask 077
cert="${1:?Expected path for the temporary public trust anchor}"
host="aws-0-eu-central-1.pooler.supabase.com"
expected="807025AD50D4ED219D2C9C7D299C004F824EB00CF7F65AFEF607D07B72E6CAFA"
mkdir -p "$(dirname "$cert")"
temp_log="$(mktemp)"
trap 'rm -f "$temp_log"' EXIT
fetched=false
for url in \
  'https://supabase.com/prod-ca-2021.crt' \
  'https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt'
do
  if curl --fail --location --silent --show-error --retry 2 --max-time 20 "$url" -o "$cert" 2>"$temp_log" &&
     openssl x509 -in "$cert" -noout -subject >/dev/null 2>&1
  then
    fetched=true
    break
  fi
done
if [[ "$fetched" != true ]]; then
  echo 'HOLD: Supabase public CA could not be obtained' >&2
  exit 1
fi
actual="$(openssl x509 -in "$cert" -noout -fingerprint -sha256 | cut -d= -f2 | tr -d ':\r\n' | tr '[:lower:]' '[:upper:]')"
if [[ "$actual" != "$expected" ]]; then
  echo 'HOLD: Supabase CA SHA-256 fingerprint mismatch' >&2
  exit 1
fi
if ! openssl x509 -in "$cert" -noout -checkend 86400 >/dev/null 2>&1; then
  echo 'HOLD: Supabase CA expired or expires within 24 hours' >&2
  exit 1
fi
# Verify the actual live shared pooler leaf certificate and hostname.
# The root fetched from the vendor is fingerprint-pinned above.
if ! timeout 20 openssl s_client \
  -starttls postgres -connect "$host:5432" -servername "$host" \
  -verify_return_error -verify_hostname "$host" -CAfile "$cert" \
  </dev/null >"$temp_log" 2>&1
then
  echo 'HOLD: Supabase pooler TLS chain or hostname validation failed' >&2
  exit 1
fi
if ! grep -q 'Verify return code: 0 (ok)' "$temp_log"; then
  echo 'HOLD: Pooler did not report a validated certificate chain' >&2
  exit 1
fi
echo 'PASS: Supabase root CA pinned and pooler certificate/hostname validated (no credentials)'
