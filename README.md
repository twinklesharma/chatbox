
# laravel-chatbox
Facilitates any laravel project to integrate chat functionality.
# Installation
Add laravelresource/resourcemaker as a requirement to composer.json :

```php
{
    "require": {
        "laravelchat/chatbox": "dev-master"
    }
}
```
Update your packages with composer update or install with composer install.

You can also add the package using `composer require laravelchat/chatbox "dev-master"` and later specifying the version you want (for now, dev-master is your best bet).

#### Service Provider
`LaravelChat\ChatBox\ChatServiceProvider::class,::class,`

And that's it! Start working with a awesome chat application!

## Publish vendor files

From the command line, run: 

    php artisan vendor:publish --tag=public --force

#### How to integrate Chatbox in laravel
