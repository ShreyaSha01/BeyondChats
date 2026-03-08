<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attachment extends Model
{
    protected $fillable = [
        'email_id',
        'filename',
        'mime_type',
        'attachment_id',
        'size'
    ];

    public function email()
    {
        return $this->belongsTo(Email::class);
    }
}