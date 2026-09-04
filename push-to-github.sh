#!/usr/bin/env bash
# Jo-Vegi — push this repository to a NEW GitHub account.
# Usage:  bash push-to-github.sh YOUR_GITHUB_USERNAME
set -e
USER="${1:-}"
if [ -z "$USER" ]; then echo "Usage: bash push-to-github.sh YOUR_GITHUB_USERNAME"; exit 1; fi

REPO="jo-vegi"
cd "$(dirname "$0")"

# 1) Make sure everything is committed locally
git init -b main 2>/dev/null || true
git config user.name  "Rayan Nashwan"
git config user.email "ZarqaFreeZone@gmail.com"
git add -A
git commit -q -m "🌿 Jo-Vegi — bilingual Jordanian produce website (AR/EN)" || echo "nothing new to commit"

# 2) Create the remote repo (needs a GitHub Personal Access Token with 'repo' scope)
#    Create one at: https://github.com/settings/tokens  ->  Generate new token (classic) -> repo
if [ -n "$GITHUB_TOKEN" ]; then
  curl -s -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" \
    https://api.github.com/user/repos -d "{\"name\":\"$REPO\",\"public\":true,\"description\":\"Jo-Vegi — Premium Jordanian Fruits & Vegetables | خضار وفواكه أردنية فاخرة\"}" > /dev/null \
    && echo "✔ Repository $USER/$REPO created (or already exists)."
fi

# 3) Push
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$USER/$REPO.git"
git branch -M main
git push -u origin main

echo ""
echo " Done! Now enable GitHub Pages:"
echo "   https://github.com/$USER/$REPO/settings/pages"
echo "   Source: Deploy from a branch -> main -> / (root) -> Save"
echo "   Live at: https://$USER.github.io/$REPO/"
