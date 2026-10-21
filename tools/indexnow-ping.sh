#!/bin/sh
# Run after each deploy: tells Bing, Yandex, Seznam and Naver (and through Bing, ChatGPT search) to recrawl every page.
DOMAIN=whit-fitness.com
KEY=f7bc49c13079c437b404f1a0e5c705d8
URLS=$(grep -o '<loc>[^<]*' sitemap.xml | sed 's/<loc>//' | sed 's/.*/"&"/' | paste -sd, -)
curl -sS -X POST https://api.indexnow.org/indexnow -H 'Content-Type: application/json; charset=utf-8' \
  -d "{\"host\":\"$DOMAIN\",\"key\":\"$KEY\",\"keyLocation\":\"https://$DOMAIN/$KEY.txt\",\"urlList\":[$URLS]}" -w '%{http_code}\n'
