# --------- base stage ---------
FROM nginx:alpine AS base
RUN rm -rf /etc/nginx/conf.d/*
# envsubst bereitstellen
RUN apk add --no-cache gettext
# --------------------------------

# --------- prod stage ---------
FROM base AS prod
COPY default.conf /etc/nginx/conf.d/default.conf
# --------------------------------

# --------- dev stage ----------
FROM base AS dev
COPY default.dev.conf.template /etc/nginx/templates/default.dev.conf.template
# start script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
# --------------------------------