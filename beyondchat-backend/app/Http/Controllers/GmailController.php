<?php

namespace App\Http\Controllers;

use Google\Client;
use Illuminate\Http\Request;

class GmailController extends Controller
{
    private function getClient()
    {
        $client = new Client();

        $client->setClientId(env('GOOGLE_CLIENT_ID'));
        $client->setClientSecret(env('GOOGLE_CLIENT_SECRET'));
        $client->setRedirectUri(env('GOOGLE_REDIRECT_URI'));

        $client->addScope('https://www.googleapis.com/auth/gmail.readonly');
        $client->addScope('https://www.googleapis.com/auth/gmail.send');

        $client->setAccessType('offline');

        return $client;
    }

    public function redirect()
    {
        $client = $this->getClient();

        return redirect($client->createAuthUrl());
    }

    public function callback(Request $request)
    {
        $client = $this->getClient();

        $token = $client->fetchAccessTokenWithAuthCode($request->code);

        session(['gmail_token' => $token]);

        return redirect('http://localhost:5173/integrations');
    }

    public function status(Request $request)
    {
        return response()->json([
            'connected' => session()->has('gmail_token')
        ]);
    }
}