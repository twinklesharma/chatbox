<?php
namespace LaravelChat\ChatBox;

use App\Http\Controllers\Controller;

class ChatController extends Controller
{

    public function index()
    {
        return view('chatview::chat');
    }

}
