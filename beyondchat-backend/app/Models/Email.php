<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Email extends Model
{
    protected $fillable = [
        'thread_id',
        'message_id',
        'from',
        'to',
        'body_html',
        'sent_at'
    ];

    public function attachments()
    {
        return $this->hasMany(Attachment::class);
    }
}