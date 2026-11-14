<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Team extends Model
{
    use HasFactory;

    protected $table = 'teams';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'team_name',
        'project_title',
        'project_description',
        'category',
        'owner_id',
        'is_published',
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function ($team) {
            $team->id ??= (string) Str::uuid();
        });
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function poster()
    {
        return $this->hasOne(Poster::class, 'team_id');
    }

    public function landingPage()
    {
        return $this->hasOne(LandingPage::class, 'team_id');
    }

    public function businessFlow()
    {
        return $this->hasOne(BusinessFlow::class, 'team_id');
    }

    public function application()
    {
        return $this->hasOne(Application::class, 'team_id');
    }

    public function questionnaireResponses()
    {
        return $this->hasMany(QuestionnaireResponse::class, 'team_id');
    }
}
