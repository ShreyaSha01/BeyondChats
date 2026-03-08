<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Schema\Blueprint;
use Google\Client;
use Google\Service\Gmail;
use App\Models\Thread;
use App\Models\Email;
use App\Models\Attachment;

class EmailController extends Controller
{
    public function __construct()
    {
        $this->ensureAttachmentsTableExists();
    }

    private function ensureAttachmentsTableExists()
    {
        if (!Schema::hasTable('attachments')) {
            try {
                Schema::create('attachments', function (Blueprint $table) {
                    $table->id();
                    $table->foreignId('email_id')->constrained('emails')->cascadeOnDelete();
                    $table->string('filename');
                    $table->string('mime_type')->nullable();
                    $table->string('attachment_id');
                    $table->integer('size')->nullable();
                    $table->timestamps();
                });
                Log::info('Created attachments table');
            } catch (\Exception $e) {
                Log::error('Failed to create attachments table: ' . $e->getMessage());
            }
        }
    }

    private function getService()
    {
        $client = new Client();

        $client->setClientId(env('GOOGLE_CLIENT_ID'));
        $client->setClientSecret(env('GOOGLE_CLIENT_SECRET'));
        $token = session('gmail_token');
        if ($token) {
            $client->setAccessToken($token);

            // Check if token is expired and refresh if needed
            if ($client->isAccessTokenExpired()) {
                if ($client->getRefreshToken()) {
                    $client->fetchAccessTokenWithRefreshToken($client->getRefreshToken());
                    $newToken = $client->getAccessToken();
                    session(['gmail_token' => $newToken]);
                    Log::info('Token refreshed successfully');
                } else {
                    Log::error('No refresh token available');
                }
            }
        } else {
            Log::error('No Gmail token found in session');
        }

        return new Gmail($client);
    }

    public function syncEmails(Request $request)
    {
        try {
            $days = $request->days;

            $service = $this->getService();

            $query = "newer_than:{$days}d";

            $messages = $service->users_messages->listUsersMessages('me', [
                'q' => $query
            ]);

            $syncedCount = 0;

            foreach ($messages->getMessages() ?? [] as $message) {
                try {
                    $msg = $service->users_messages->get('me', $message->getId());

                    $threadId = $msg->getThreadId();

                    $payload = $msg->getPayload();
                    $headers = $payload->getHeaders();

                    $from = null;
                    $to = null;
                    $subject = null;
                    $sentAt = null;

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

                        if ($header->getName() === 'Date') {
                            $sentAt = $header->getValue();
                        }
                    }

                    $body = '';
                    $attachments = [];
                    $parts = $payload->getParts();

                    if (!$parts) {
                        $bodyPart = $payload->getBody();
                        if ($bodyPart && $bodyPart->getData()) {
                            $body = base64_decode(strtr($bodyPart->getData(), '-_', '+/'));
                        }
                    } else {
                        $this->processParts($parts, $body, $attachments);
                    }

                    $thread = Thread::firstOrCreate([
                        'thread_id' => $threadId,
                        'subject' => $subject
                    ]);

                    $email = Email::create([
                        'thread_id' => $threadId,
                        'message_id' => $msg->getId(),
                        'from' => $from,
                        'to' => $to,
                        'body_html' => $body,
                        'sent_at' => $sentAt ? \Carbon\Carbon::parse($sentAt) : now()
                    ]);

                    // Save attachments if table exists
                    if (\Schema::hasTable('attachments')) {
                        Log::info("Processing " . count($attachments) . " attachments for email " . $email->id);
                        foreach ($attachments as $attachment) {
                            try {
                                $created = Attachment::create([
                                    'email_id' => $email->id,
                                    'filename' => $attachment['filename'],
                                    'mime_type' => $attachment['mime_type'],
                                    'attachment_id' => $attachment['attachment_id'],
                                    'size' => $attachment['size']
                                ]);
                                Log::info("Created attachment: " . $created->id . " - " . $attachment['filename']);
                            } catch (\Exception $e) {
                                Log::error('Failed to save attachment: ' . $e->getMessage());
                            }
                        }
                    } else {
                        Log::warning('Attachments table does not exist, skipping attachment save');
                    }

                    $syncedCount++;
                } catch (\Exception $e) {
                    // Log individual email error but continue processing
                    \Log::error('Failed to process email ' . $message->getId() . ': ' . $e->getMessage());
                    continue;
                }
            }

            return response()->json([
                "message" => "Successfully synced {$syncedCount} emails"
            ]);
        } catch (\Exception $e) {
            \Log::error('Email sync failed: ' . $e->getMessage());
            return response()->json([
                "message" => "Error syncing emails: " . $e->getMessage()
            ], 500);
        }
    }

    private function processParts($parts, &$body, &$attachments)
    {
        if (!$parts)
            return;

        $htmlBody = '';
        $plainBody = '';

        foreach ($parts as $part) {
            try {
                $filename = $part->getFilename();

                if ($filename) {
                    // This is an attachment
                    $bodyPart = $part->getBody();
                    if ($bodyPart && $bodyPart->getAttachmentId()) {
                        Log::info("Found attachment: " . $filename . " (ID: " . $bodyPart->getAttachmentId() . ")");
                        $attachments[] = [
                            'filename' => $filename,
                            'mime_type' => $part->getMimeType(),
                            'attachment_id' => $bodyPart->getAttachmentId(),
                            'size' => $bodyPart->getSize()
                        ];
                    }
                } elseif ($part->getMimeType() === 'text/html') {
                    $bodyPart = $part->getBody();
                    if ($bodyPart && $bodyPart->getData()) {
                        $htmlBody = base64_decode(
                            strtr($bodyPart->getData(), '-_', '+/')
                        );
                    }
                } elseif ($part->getMimeType() === 'text/plain') {
                    $bodyPart = $part->getBody();
                    if ($bodyPart && $bodyPart->getData()) {
                        $plainBody = nl2br(htmlspecialchars(base64_decode(
                            strtr($bodyPart->getData(), '-_', '+/')
                        )));
                    }
                } elseif (in_array($part->getMimeType(), ['multipart/alternative', 'multipart/mixed', 'multipart/related'])) {
                    $tempBody = '';
                    $this->processParts($part->getParts(), $tempBody, $attachments);
                    if (!empty($tempBody)) {
                        $body = $tempBody;
                    }
                }
            } catch (\Exception $e) {
                Log::warning('Failed to process email part: ' . $e->getMessage());
                continue;
            }
        }

        if (!empty($htmlBody)) {
            $body = $htmlBody;
        } elseif (!empty($plainBody) && empty($body)) {
            $body = $plainBody;
        }
    }

    public function getThreads()
    {
        $threads = Thread::orderBy('created_at', 'desc')->get();

        return response()->json($threads);
    }

    public function getThreadEmails($threadId)
    {
        $emails = Email::where('thread_id', $threadId)
            ->with('attachments')
            ->orderBy('sent_at', 'asc')
            ->get();

        return response()->json($emails);
    }

    public function replyToThread(Request $request)
    {
        $threadId = $request->thread_id;
        $message = $request->message;
        $to = $request->to;
        $subject = $request->subject;

        $service = $this->getService();

        $rawMessage = "To: {$to}\r\n";
        $rawMessage .= "Subject: Re: {$subject}\r\n";
        $rawMessage .= "In-Reply-To: {$threadId}\r\n";
        $rawMessage .= "References: {$threadId}\r\n";
        $rawMessage .= "\r\n{$message}";

        $encodedMessage = rtrim(strtr(base64_encode($rawMessage), '+/', '-_'), '=');

        $gmailMessage = new \Google\Service\Gmail\Message();
        $gmailMessage->setRaw($encodedMessage);
        $gmailMessage->setThreadId($threadId);

        try {
            $sentMessage = $service->users_messages->send("me", $gmailMessage);

            // Get the authenticated user's email address dynamically
            $userEmail = $service->users->getProfile('me')->getEmailAddress();

            Email::create([
                'thread_id' => $threadId,
                'message_id' => $sentMessage->getId(),
                'from' => $userEmail,
                'to' => $to,
                'body_html' => nl2br(htmlspecialchars($message)),
                'sent_at' => now()
            ]);

            return response()->json([
                "message" => "Reply sent successfully"
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send reply: ' . $e->getMessage());
            return response()->json([
                "message" => "Failed to send reply: " . $e->getMessage()
            ], 500);
        }
    }

    public function downloadAttachment($messageId, $attachmentId)
    {
        try {
            $service = $this->getService();

            $attachment = $service->users_messages_attachments->get('me', $messageId, $attachmentId);

            $data = base64_decode(strtr($attachment->getData(), '-_', '+/'));

            // Get attachment info from database
            $attachmentInfo = \App\Models\Attachment::whereHas('email', function ($query) use ($messageId) {
                $query->where('message_id', $messageId);
            })->where('attachment_id', $attachmentId)->first();

            $filename = $attachmentInfo ? $attachmentInfo->filename : 'attachment';
            $mimeType = $attachmentInfo ? $attachmentInfo->mime_type : 'application/octet-stream';

            return response($data)
                ->header('Content-Type', $mimeType)
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
        } catch (\Exception $e) {
            Log::error('Attachment download failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to download attachment'], 500);
        }
    }
}