<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GmailController;

Route::get('/auth/google', [GmailController::class, 'redirect']);
Route::get('/auth/google/callback', [GmailController::class, 'callback']);