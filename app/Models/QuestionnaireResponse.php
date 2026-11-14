<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuestionnaireResponse extends Model
{
    protected $fillable = [
        'team_id',
        'user_id',
        'respondent_role',
        'respondent_name',
        'respondent_address',
        'respondent_affiliation',
    ];

    public function answers()
    {
        return $this->hasMany(QuestionnaireAnswer::class, 'response_id');
    }
}
