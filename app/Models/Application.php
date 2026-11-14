<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Application extends Model
{
    protected $table = 'applications';
    protected $primaryKey = 'application_id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['application_id', 'team_id', 'application_url'];

    protected static function booted(): void
    {
        static::creating(fn ($application) => $application->application_id ??= (string) Str::uuid());
    }

    public function team()
    {
        return $this->belongsTo(Team::class, 'team_id');
    }
}
