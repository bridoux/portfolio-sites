#!/usr/bin/env bash
# Minimal Vercel REST helper using the Vercel CLI's saved login (the token is never printed).
#   tools/vercel-api.sh <METHOD> <path> [jsonBody]
set -euo pipefail
TEAM=team_ym358fE2AJNcKgAw4p1JiW0B
TOKEN=$(node -e "console.log(require(process.env.APPDATA+'/xdg.data/com.vercel.cli/auth.json').token)")
METHOD=$1; P=$2; BODY=${3:-}
SEP='?'; [[ "$P" == *\?* ]] && SEP='&'
if [ -n "$BODY" ]; then
  curl -sS -X "$METHOD" "https://api.vercel.com${P}${SEP}teamId=${TEAM}" -H "Authorization: Bearer ${TOKEN}" -H "Content-Type: application/json" --data "$BODY" -w '\nHTTP %{http_code}\n'
else
  curl -sS -X "$METHOD" "https://api.vercel.com${P}${SEP}teamId=${TEAM}" -H "Authorization: Bearer ${TOKEN}" -w '\nHTTP %{http_code}\n'
fi
