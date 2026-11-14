<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function votes()
    {
        $teams = Team::query()
            ->where('is_published', true)
            ->withCount('questionnaireResponses')
            ->orderByDesc('questionnaire_responses_count')
            ->orderBy('team_name')
            ->get(['id', 'team_name', 'project_title']);

        return response()->json([
            'data' => $teams->map(fn (Team $team) => [
                'id' => $team->id,
                'team_name' => $team->team_name,
                'project_title' => $team->project_title,
                'votes' => $team->questionnaire_responses_count,
            ]),
        ]);
    }

    public function index(Request $request)
    {
        $query = Team::with(['poster', 'landingPage', 'businessFlow', 'application'])
            ->where('is_published', true);

        if ($request->filled('search')) {
            $search = $request->string('search')->trim()->toString();
            $query->where(fn ($builder) => $builder
                ->where('team_name', 'like', "%{$search}%")
                ->orWhere('project_title', 'like', "%{$search}%")
                ->orWhere('category', 'like', "%{$search}%"));
        }

        if ($request->filled('category')) {
            $query->where('category', $request->string('category')->toString());
        }

        $perPage = min(max($request->integer('per_page', 12), 1), 50);

        return $query->latest()->paginate($perPage);
    }

    public function categories()
    {
        return Team::query()
            ->where('is_published', true)
            ->whereNotNull('category')
            ->where('category', '!=', '')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');
    }

    public function stats()
    {
        $published = Team::query()->where('is_published', true);

        return response()->json([
            'projects' => (clone $published)->count(),
            'teams' => (clone $published)->distinct()->count('owner_id'),
            'categories' => (clone $published)->whereNotNull('category')->where('category', '!=', '')->distinct()->count('category'),
        ]);
    }

    public function show(Team $team)
    {
        abort_unless($team->is_published, 404);

        return $team->load(['poster', 'landingPage', 'businessFlow', 'application']);
    }
}
