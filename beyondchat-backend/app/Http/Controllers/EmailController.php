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

            $payload = $msg->getPayload();
            $headers = $payload->getHeaders();

            $from = null;
            $to = null;
            $subject = null;

            foreach ($headers as $header) {
                if ($header->getName() === 'From') {
                    $from = $header->getValue();
                }

                if ($header->getName() === 'To') {
                    $to = $header->getValue();
                }

                if ($header->getName() === 'Subject') {
                    $subject = $header->getValue();
                }
            }

            // Extract HTML body
            $body = '';
            $parts = $payload->getParts();

            if ($parts) {
                foreach ($parts as $part) {
                    if ($part->getMimeType() === 'text/html') {
                        $body = base64_decode(
                            strtr($part->getBody()->getData(), '-_', '+/')
                        );
                    }
                }
            }

            Thread::firstOrCreate([
                'thread_id' => $threadId,
                'subject' => $subject
            ]);

            Email::create([
                'thread_id' => $threadId,
                'message_id' => $msg->getId(),
                'from' => $from,
                'to' => $to,
                'body_html' => $body,
                'sent_at' => now()
            ]);
        }

        return response()->json([
            "message" => "Emails synced successfully"
        ]);
    }

    public function getThreads()
    {
        $threads = Thread::orderBy('created_at', 'desc')->get();

        return response()->json($threads);
    }

    public function getThreadEmails($threadId)
    {
        $emails = Email::where('thread_id', $threadId)
            ->orderBy('sent_at', 'asc')
            ->get();

        return response()->json($emails);
    }
}