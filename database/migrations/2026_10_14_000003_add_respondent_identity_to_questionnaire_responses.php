<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('questionnaire_responses', function (Blueprint $table) {
            $table->string('respondent_name')->nullable();
            $table->text('respondent_address')->nullable();
            $table->string('respondent_affiliation')->nullable();
            $table->foreignId('user_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('questionnaire_responses', function (Blueprint $table) {
            $table->dropColumn(['respondent_name', 'respondent_address', 'respondent_affiliation']);
        });
    }
};
