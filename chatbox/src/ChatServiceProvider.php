<?php

namespace LaravelChat\ChatBox;

use Illuminate\Support\ServiceProvider;

class ChatServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap the application services.
     *
     * @return void
     */
    public function boot()
    {
        $this->loadViewsFrom(__DIR__.'/module/chat', 'chatview');
        $this->publishes([
        __DIR__.'/module/chat/css' => public_path('laravelchat/css'),
    ], 'public');
        $this->publishes([
        __DIR__.'/module/chat/js' => public_path('laravelchat/js'),
    ], 'public');
        $this->publishes([
        __DIR__.'/module/chat/images' => public_path('laravelchat/images'),
    ], 'public');
        $this->publishes([
        __DIR__.'/module/chat/libs' => public_path('/libs'),
    ], 'public');
        
    }

    /**
     * Register the application services.
     *
     * @return void
     */
    public function register()
    {
        include __DIR__.'/routes.php';
        $this->app->make('LaravelChat\ChatBox\ChatController');
    }
}
