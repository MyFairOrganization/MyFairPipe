# --------- base stage ---------
FROM nginx:alpine AS base
RUN rm -rf /etc/nginx/conf.d/*
# --------------------------------

# --------- prod stage ---------
FROM base AS prod
COPY default.conf /etc/nginx/conf.d/default.conf
# --------------------------------

# --------- dev stage ----------
FROM base AS dev
COPY default.dev.conf /etc/nginx/conf.d/default.conf
# --------------------------------