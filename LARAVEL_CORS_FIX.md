# Laravel CORS Fix untuk React Native

## 1. Install CORS Package (Laravel 8 ke bawah)
```bash
composer require fruitcake/laravel-cors
```

## 2. Publish Config
```bash
php artisan vendor:publish --tag=cors
```

## 3. Update config/cors.php
```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    
    'allowed_methods' => ['*'],
    
    'allowed_origins' => ['*'], // Atau specific: ['https://yourdomain.com']
    
    'allowed_origins_patterns' => [],
    
    'allowed_headers' => ['*'],
    
    'exposed_headers' => [],
    
    'max_age' => 0,
    
    'supports_credentials' => false,
];
```

## 4. Update app/Http/Kernel.php
```php
protected $middleware = [
    // ...
    \Fruitcake\Cors\HandleCors::class, // Add this
];

protected $middlewareGroups = [
    'api' => [
        \Fruitcake\Cors\HandleCors::class, // Or here
        'throttle:api',
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ],
];
```

## 5. Atau Manual CORS di Nginx
```nginx
location /api {
    # CORS Headers
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Accept,Authorization' always;
    add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
    
    # Handle preflight OPTIONS request
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Accept,Authorization';
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }
    
    try_files $uri $uri/ /index.php?$query_string;
}
```

## 6. Test CORS
```bash
curl -I -X OPTIONS https://andrepangestu.com/api/people/recommended \
  -H "Origin: http://localhost:8081" \
  -H "Access-Control-Request-Method: GET"

# Should return:
# Access-Control-Allow-Origin: *
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

## 7. Restart Server
```bash
# Nginx
sudo systemctl restart nginx

# PHP-FPM
sudo systemctl restart php8.2-fpm

# Clear Laravel cache
php artisan config:clear
php artisan cache:clear
```
