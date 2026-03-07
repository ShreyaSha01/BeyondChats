<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Google\Client;
use Google\Service\Gmail;
use App\Models\Thread;
use App\Models\Email;

class EmailController extends Controller
{
    private function getService()
    {
        $client = new Client();

        $client->setClientId(env('GOOGLE_CLIENT_ID'));
        $client->setClientSecret(env('GOOGLE_CLIENT_SECRET'));
        $token = session('gmail_token');
        if ($token) {
            $client->setAccessToken($token);
        }

        return new Gmail($client);
    }

    public function syncEmails(Request $request)
    {
        $days = $request->days;

        $service = $this->getService();

        $query = "newer_than:{$days}d";

        $messages = $service->users_messages->listUsersMessages('me', [
            'q' => $query
        ]);

        foreach ($messages->getMessages() ?? [] as $message) {

            $msg = $service->users_messages->get('me', $message->getId());

            $threadId = $msg->getThreadId();

            Thread::firstOrCreate([
                'thread_id' => $threadId
            ]);

            Email::create([
                'thread_id' => $threadId,
                'message_id' => $msg->getId(),
                'body_html' => json_encode($msg->getPayload())
            ]);
        }

        return response()->json([
            "message" => "Emails synced successfully"
        ]);
    }
}