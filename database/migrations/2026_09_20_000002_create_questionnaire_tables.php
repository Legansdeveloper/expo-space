<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questionnaire_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('team_id')->constrained('teams', 'id')->cascadeOnDelete();
            $table->string('section')->nullable();
            $table->text('question');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('questionnaire_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('team_id')->constrained('teams', 'id')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('respondent_role')->default('mitra');
            $table->timestamps();
            $table->unique(['team_id', 'user_id']);
        });

        Schema::create('questionnaire_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('response_id')->constrained('questionnaire_responses')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('questionnaire_questions')->cascadeOnDelete();
            $table->unsignedTinyInteger('score');
            $table->timestamps();
            $table->unique(['response_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questionnaire_answers');
        Schema::dropIfExists('questionnaire_responses');
        Schema::dropIfExists('questionnaire_questions');
    }
};
