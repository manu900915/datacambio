FROM php:8.3-fpm-alpine

# Instalar dependencias del sistema y extensiones requeridas por Laravel
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    oniguruma-dev \
    mariadb-client \
    bash

# Instalar extensiones PHP necesarias
RUN docker-php-ext-install pdo pdo_mysql mbstring xml bcmath gd

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

EXPOSE 9000
CMD ["php-fpm"]
