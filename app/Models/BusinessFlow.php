<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class BusinessFlow extends Model
{
    protected $primaryKey = 'business_flow_id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['business_flow_id', 'team_id', 'business_flow_type', 'business_flow_url', 'business_flow_image'];

    protected static function booted(): void
    {
        static::creating(fn ($flow) => $flow->business_flow_id ??= (string) Str::uuid());
    }

    public function team()
    {
        return $this->belongsTo(Team::class, 'team_id');
    }
}
