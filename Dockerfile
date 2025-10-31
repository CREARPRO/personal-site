FROM php:8.1-apache

# Copiar código al directorio por defecto de Apache
WORKDIR /var/www/html
COPY . /var/www/html/

# Habilitar mod_rewrite (si se requiere)
RUN a2enmod rewrite

# Ajustes permisos (si es necesario)
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80

CMD ["apache2-foreground"]
