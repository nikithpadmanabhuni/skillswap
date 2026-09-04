#!/usr/bin/env bash
# Full matrix sweep: every route, in every theme, at every breakpoint.
set -uo pipefail
U="${U:-http://localhost:5173}"
A="${A:-http://localhost:5174}"

UR="/,/login,/signup,/reset-password,/onboarding,/explore,/u/u-002,/u/u-002/propose,/sessions,/sessions/s-008,/sessions/s-010/review,/sessions/s-008/call,/messages,/messages/s-008,/mesh,/mesh/m-002,/karma,/perks,/perks/p-001/redeem,/leaderboard,/profile,/profile/edit,/notifications,/settings,/assistant"
AR="/,/login,/users,/users/u-002,/moderation,/sessions,/karma,/perks,/perks/new,/perks/p-001,/redemptions,/leaderboard,/settings"

widths=(1440 768 390)
heights=(900 1024 844)
fail=0

run() { # label base cookie routes outdir theme w h
  local out
  out=$(BASE="$2" SESSION_COOKIE="$3" ROUTES="$4" OUT="$5" THEME="$6" WIDTH="$7" HEIGHT="$8" \
        node tools/shoot.mjs 2>&1)
  local ok bad
  ok=$(printf '%s\n' "$out" | grep -c '^200') || true
  bad=$(printf '%s\n' "$out" | grep -cE '^(ERR|[45][0-9]{2}) |⚠') || true
  printf '%-6s %-5s %4sx%-4s  %2s ok  %s issues\n' "$1" "$6" "$7" "$8" "$ok" "$bad"
  if [ "$bad" != "0" ]; then
    printf '%s\n' "$out" | grep -E -A2 '^(ERR|[45][0-9]{2}) |⚠'
    fail=1
  fi
}

for theme in light dark night; do
  for i in 0 1 2; do
    run user  "$U" skillswap_session "$UR" shots/user  "$theme" "${widths[$i]}" "${heights[$i]}"
    run admin "$A" skillswap_admin   "$AR" shots/admin "$theme" "${widths[$i]}" "${heights[$i]}"
  done
done

echo
if [ "$fail" = "0" ]; then echo "SWEEP CLEAN"; else echo "SWEEP FOUND ISSUES"; exit 1; fi
