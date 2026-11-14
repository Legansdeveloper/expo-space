<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuestionnaireQuestion extends Model
{
    protected $fillable = ['team_id', 'section', 'question', 'sort_order'];
}
