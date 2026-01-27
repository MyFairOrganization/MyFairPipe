#!/bin/sh
set -e

# Pflicht-Variablen (fail fast)
: "${DOMAIN_HOST:?DOMAIN_HOST is required}"
: "${DOMAIN:?DOMAIN is required}"
: "${SCHEME:?SCHEME is required}"
: "${API_DOMAIN_HOST:?API_DOMAIN_HOST is required}"
: "${CDN_DOMAIN_HOST:?CDN_DOMAIN_HOST is required}"

# Render config
envsubst '$DOMAIN_HOST $DOMAIN $SCHEME $API_DOMAIN_HOST $CDN_DOMAIN_HOST' \
  < /etc/nginx/templates/default.dev.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
