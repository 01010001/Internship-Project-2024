FROM nginx:alpine

COPY . /usr/share/nginx/html

RUN chmod +x /usr/share/nginx/html/entrypoint.sh

ENTRYPOINT ["/usr/share/nginx/html/entrypoint.sh"]

EXPOSE 80