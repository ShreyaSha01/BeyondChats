<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GmailController;
use App\Http\Controllers\EmailController;

Route::middleware([\Illuminate\Session\Middleware\StartSession::class])->group(function () {
    Route::get('/auth/google', [GmailController::class, 'redirect']);
    Route::get('/auth/google/callback', [GmailController::class, 'callback']);
    Route::get('/gmail/status', [GmailController::class, 'status']);
    Route::post('/sync-emails', [EmailController::class, 'syncEmails']);
    Route::get('/threads', [EmailController::class, 'getThreads']);
    Route::get('/threads/{threadId}', [EmailController::class, 'getThreadEmails']);
});