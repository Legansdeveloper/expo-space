<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class LandingPage extends Model
{
    use HasFactory;

    protected $table = 'landing_pages';
    protected $primaryKey = 'landing_page_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['landing_page_id', 'team_id', 'landing_page_url'];

    protected static function booted(): void
    {
        static::creating(function ($landingPage) {
            $landingPage->landing_page_id ??= (string) Str::uuid();
        });
    }

    public function team()
    {
        return $this->belongsTo(Team::class, 'team_id');
    }
}
