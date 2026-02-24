#!/bin/sh

# Replace the placeholders in the template and save to config.js
envsubst '${API_BASE_URL}${AUTH_AUTHORITY}${AUTH_CLIENT_ID}${AUTH_REDIRECT_URI}${AUTH_POST_LOGOUT_URI}' \
< /usr/share/nginx/html/config.template.js \
> /usr/share/nginx/html/config.js

# Start nginx
exec nginx -g 'daemon off;'