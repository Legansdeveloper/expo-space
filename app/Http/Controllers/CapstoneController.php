<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\BusinessFlow;
use App\Models\LandingPage;
use App\Models\Poster;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CapstoneController extends Controller
{
    public function data(Request $request): JsonResponse
    {
        $team = Team::with(['poster', 'landingPage', 'businessFlow', 'application'])
            ->where('owner_id', $request->user()->id)
            ->first();

        return response()->json(['team' => $team]);
    }

    public function team(Request $request): JsonResponse
    {
        abort_unless($request->user()->role === 'capstone', 403);
        $data = $request->validate([
            'team_name' => ['required', 'string', 'max:255'],
            'project_title' => ['required', 'string', 'max:255'],
            'project_description' => ['nullable', 'string'],
            'category' => ['nullable', 'string', 'max:255'],
        ]);

        $team = Team::updateOrCreate(
            ['owner_id' => $request->user()->id],
            $data,
        );

        return response()->json(['team' => $team->load(['poster', 'landingPage', 'businessFlow', 'application'])]);
    }

    public function publish(Request $request): JsonResponse
    {
        abort_unless($request->user()->role === 'capstone', 403);
        $team = Team::with(['poster', 'landingPage', 'businessFlow', 'application'])
            ->where('owner_id', $request->user()->id)
            ->firstOrFail();

        abort_unless($team->poster && $team->landingPage && $team->businessFlow && $team->application, 422, 'Lengkapi semua komponen project sebelum publikasi.');
        $team->update(['is_published' => true]);

        return response()->json(['team' => $team->fresh(['poster', 'landingPage', 'businessFlow', 'application'])]);
    }

    public function component(Request $request, string $type): JsonResponse
    {
        abort_unless($request->user()->role === 'capstone', 403);
        $team = Team::where('owner_id', $request->user()->id)->firstOrFail();
        $rules = match ($type) {
            'landing-page' => ['landing_page_url' => ['required', 'url', 'max:255']],
            'application' => ['application_url' => ['required', 'url', 'max:255']],
            'business-flow' => [
                'business_flow_type' => ['required', 'in:url,image'],
                'business_flow_url' => ['nullable', 'url', 'max:255', 'required_if:business_flow_type,url'],
                'business_flow_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            ],
            default => [],
        };
        $data = $request->validate($rules);

        if ($type === 'landing-page') {
            $record = LandingPage::updateOrCreate(['team_id' => $team->id], $data);
        } elseif ($type === 'application') {
            $record = Application::updateOrCreate(['team_id' => $team->id], $data);
        } elseif ($type === 'business-flow') {
            $existing = BusinessFlow::where('team_id', $team->id)->first();
            if ($data['business_flow_type'] === 'image' && $request->hasFile('business_flow_image')) {
                if ($existing?->business_flow_image) {
                    Storage::disk('public')->delete($existing->business_flow_image);
                }
                $data['business_flow_image'] = $request->file('business_flow_image')->store('business-flows', 'public');
            } elseif ($data['business_flow_type'] === 'image' && $existing?->business_flow_image) {
                $data['business_flow_image'] = $existing->business_flow_image;
            } elseif ($data['business_flow_type'] === 'image') {
                return response()->json(['message' => 'Gambar business flow wajib diunggah.'], 422);
            }
            $data['business_flow_url'] = $data['business_flow_type'] === 'url' ? $data['business_flow_url'] : null;
            $data['business_flow_image'] = $data['business_flow_type'] === 'image' ? $data['business_flow_image'] : null;
            $record = BusinessFlow::updateOrCreate(['team_id' => $team->id], $data);
        } else {
            abort(404);
        }

        return response()->json(['data' => $record]);
    }

    public function poster(Request $request): JsonResponse
    {
        abort_unless($request->user()->role === 'capstone', 403);
        $team = Team::where('owner_id', $request->user()->id)->firstOrFail();
        $request->validate(['poster_image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120']]);
        $existing = Poster::where('team_id', $team->id)->first();
        if ($existing) {
            Storage::disk('public')->delete($existing->poster_image);
            $existing->delete();
        }
        $path = $request->file('poster_image')->store('posters', 'public');
        $poster = Poster::create(['team_id' => $team->id, 'poster_image' => $path]);

        return response()->json(['data' => $poster]);
    }

    public function destroy(Request $request, string $type): JsonResponse
    {
        abort_unless($request->user()->role === 'capstone', 403);
        $team = Team::where('owner_id', $request->user()->id)->firstOrFail();
        $model = match ($type) {
            'poster' => Poster::where('team_id', $team->id)->first(),
            'landing-page' => LandingPage::where('team_id', $team->id)->first(),
            'business-flow' => BusinessFlow::where('team_id', $team->id)->first(),
            'application' => Application::where('team_id', $team->id)->first(),
            default => abort(404),
        };
        if ($model) {
            if ($model instanceof Poster) Storage::disk('public')->delete($model->poster_image);
            $model->delete();
        }

        return response()->json(['message' => 'Komponen berhasil dihapus.']);
    }
}
