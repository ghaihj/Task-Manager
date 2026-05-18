<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\AdminNotification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class AdminMailController extends Controller
{
    public function sendToOneUser(Request $request, User $user)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string'
        ]);

        Mail::to($user->email)->queue(new AdminNotification($request->subject, $request->message));

        return response()->json(['message' => "Email queued successfully for {$user->email}"]);
    }

    public function sendToAllUsers(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string'
        ]);

        $users = User::all();

        foreach ($users as $user) {
            Mail::to($user->email)->queue(new AdminNotification($request->subject, $request->message));
        }

        return response()->json(['message' => "Bulk email queued successfully for {$users->count()} users."]);
    }
}
