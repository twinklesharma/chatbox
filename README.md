
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
`LaravelChat\ChatBox\ChatServiceProvider::class,`

And that's it! Start working with a awesome chat application!

## Publish vendor files

From the command line, run: 

    php artisan vendor:publish --tag=public --force

# How to integrate Chatbox in laravel
Firstly you have to register the users in your chat app for this you can use the APIs of quickblox (https://quickblox.com/developers/Users).

After registration of users, open your login blade file and add the following code:

`<script type="text/javascript">
 $(document).ready(function(){ 
 $('#myform1').click(function(){
 sessionStorage.clear();
 var login = $('#login-name').val();
 var pass = $('#login-pass').val();    
 sessionStorage.setItem('login',login );
 sessionStorage.setItem('pass', pass);  
 });  });
 </script> `
 
 Where,
 #myform1 is the id of login form, #login-name is the id of username/email and #login-pass is the id password input field.
 In the above, code we are just storing the user's credentails in a session so that we can use this in connection.js which allows user to start chat.


