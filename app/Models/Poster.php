<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Poster extends Model
{
    use HasFactory;

    protected $table = 'posters';
    protected $primaryKey = 'poster_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['poster_id', 'team_id', 'poster_image'];

    protected static function booted(): void
    {
        static::creating(function ($poster) {
            $poster->poster_id ??= (string) Str::uuid();
        });
    }

    public function team()
    {
        return $this->belongsTo(Team::class, 'team_id');
    }
}
