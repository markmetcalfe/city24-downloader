# city24-downloader

## Nginx Config
```
server {
    server_name city24.markmetcalfe.io;

    include includes/markmetcalfe.io.conf;
    include includes/markmetcalfe.io.cert.conf;

    # City24 Script
    location ~ (/.*) {
        include uwsgi_params;
        uwsgi_pass city24:7629;
        uwsgi_param PATH_INFO "$1";
        uwsgi_intercept_errors on;
    }
}
```

## Docker-compose Config
```
version: '3.4'

services:
  city24:
    image: city24-flask
    build:
      context: /home/mark/www/city24-downloader/.
      dockerfile: Dockerfile-flask
    restart: always
    environment:
      - TZ=Pacific/Auckland
    volumes:
      - "/home/mark/www/city24-downloader:/app"
    networks:
      - city24

networks:
  city24:
    driver: bridge
```