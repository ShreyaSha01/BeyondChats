<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class EmailController extends Controller
{
    public function syncEmails(Request $request)
    {
        $days = $request->days;

        return response()->json([
            "message" => "Email sync started",
            "days_requested" => $days
        ]);
    }
}