# 1. Temel imajımız: PHP 8.2 ve Apache web sunucusu
FROM php:8.2-apache

# 2. Gerekli sistem paketlerini ve PHP PostgreSQL eklentilerini kuruyoruz
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo pdo_pgsql pgsql mbstring exif pcntl bcmath gd

# 3. Apache'nin ana klasörünü Laravel'in 'public' klasörüne yönlendiriyoruz
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# 4. Laravel yönlendirmeleri için Apache mod_rewrite modülünü aktif ediyoruz
RUN a2enmod rewrite

# 5. Composer'ı (PHP paket yöneticisi) indiriyoruz
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 6. Sunucu içindeki çalışma klasörümüzü belirliyoruz
WORKDIR /var/www/html

# 7. Senin projenin tüm dosyalarını sunucuya kopyalıyoruz
COPY . .

# 8. Laravel paketlerini yüklüyoruz
RUN composer install --no-interaction --optimize-autoloader --no-dev

# 9. Laravel'in log ve cache yazabilmesi için klasör izinlerini ayarlıyoruz
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# 10. Web sunucusunun dinleyeceği portu belirtiyoruz
EXPOSE 80

# 11. Sunucuyu başlatma komutu
CMD ["apache2-foreground"]
