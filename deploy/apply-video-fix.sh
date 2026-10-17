#!/bin/bash
set -euo pipefail

APP=/root/learnhub
TAR=/root/video-upload-fix.tar

if [ ! -f "$TAR" ]; then
  echo "Khong thay $TAR. Hay scp file tu Windows truoc."
  exit 1
fi

cd "$APP"
tar -xf "$TAR"

mkdir -p /var/learnhub-videos/n0 /var/learnhub-videos/tmp

if [ -f "$APP/deploy/nginx-learnhub.conf" ]; then
  cp /etc/nginx/sites-available/learnhub /etc/nginx/sites-available/learnhub.bak.$(date +%s) 2>/dev/null || true
  cp "$APP/deploy/nginx-learnhub.conf" /etc/nginx/sites-available/learnhub
  ln -sf /etc/nginx/sites-available/learnhub /etc/nginx/sites-enabled/learnhub
  rm -f /etc/nginx/sites-enabled/default
  nginx -t
  systemctl reload nginx
fi

cd "$APP/backend"
mvn -DskipTests package
cp target/*.jar /opt/learnhub/app.jar
systemctl restart learnhub

cd "$APP/frontend"
npm ci
npm run build
mkdir -p /var/www/learnhub
cp -r dist/* /var/www/learnhub/

echo "XONG. Thu upload video lai tren http://103.149.170.14"
