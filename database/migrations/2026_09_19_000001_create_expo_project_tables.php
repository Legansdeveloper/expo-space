<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('mitra')->after('password');
        });

        Schema::create('teams', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('team_name');
            $table->string('project_title');
            $table->text('project_description')->nullable();
            $table->string('category')->nullable();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->boolean('is_published')->default(false);
            $table->timestamps();
        });

        Schema::create('posters', function (Blueprint $table) {
            $table->uuid('poster_id')->primary();
            $table->foreignUuid('team_id')->unique()->constrained('teams', 'id')->cascadeOnDelete();
            $table->string('poster_image');
            $table->timestamps();
        });

        Schema::create('landing_pages', function (Blueprint $table) {
            $table->uuid('landing_page_id')->primary();
            $table->foreignUuid('team_id')->unique()->constrained('teams', 'id')->cascadeOnDelete();
            $table->string('landing_page_url');
            $table->timestamps();
        });

        Schema::create('business_flows', function (Blueprint $table) {
            $table->uuid('business_flow_id')->primary();
            $table->foreignUuid('team_id')->unique()->constrained('teams', 'id')->cascadeOnDelete();
            $table->enum('business_flow_type', ['url', 'image']);
            $table->string('business_flow_url')->nullable();
            $table->string('business_flow_image')->nullable();
            $table->timestamps();
        });

        Schema::create('applications', function (Blueprint $table) {
            $table->uuid('application_id')->primary();
            $table->foreignUuid('team_id')->unique()->constrained('teams', 'id')->cascadeOnDelete();
            $table->string('application_url');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
        Schema::dropIfExists('business_flows');
        Schema::dropIfExists('landing_pages');
        Schema::dropIfExists('posters');
        Schema::dropIfExists('teams');
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn('role'));
    }
};
