<?php

namespace App\Http\Controllers;

use App\Models\QuestionnaireAnswer;
use App\Models\QuestionnaireQuestion;
use App\Models\QuestionnaireResponse;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuestionnaireController extends Controller
{
    private const TEMPLATE = [
        ['Kemudahan Penggunaan', 'Sistem mudah dipahami dan digunakan oleh pengguna.'],
        ['Kemudahan Penggunaan', 'Saya dapat menemukan informasi proyek yang dibutuhkan dengan mudah.'],
        ['Kemudahan Penggunaan', 'Fitur-fitur dalam sistem tersusun secara jelas dan mudah diakses.'],
        ['Pengelolaan Proyek', 'Sistem memudahkan mahasiswa dalam mengelola informasi proyek capstone.'],
        ['Pengelolaan Proyek', 'Sistem memudahkan mahasiswa dalam mengunggah dan memperbarui poster proyek.'],
        ['Pengelolaan Proyek', 'Sistem membantu mitra industri melihat informasi proyek yang ditawarkan mahasiswa.'],
        ['Fitur dan Informasi', 'Informasi poster, landing page, alur bisnis, dan aplikasi proyek disajikan dengan jelas.'],
        ['Fitur dan Informasi', 'Fitur yang tersedia sudah sesuai dengan kebutuhan mahasiswa dan mitra industri.'],
        ['Kepuasan dan Manfaat', 'Sistem membantu meningkatkan efektivitas komunikasi dan pertukaran informasi antara mahasiswa dan mitra industri.'],
        ['Kepuasan dan Manfaat', 'Secara keseluruhan, saya puas dengan sistem yang dikembangkan.'],
    ];

    public function questions(Request $request): JsonResponse
    {
        abort_unless($request->user()->role === 'capstone', 403);
        $team = Team::where('owner_id', $request->user()->id)->firstOrFail();
        $questions = QuestionnaireQuestion::where('team_id', $team->id)->orderBy('sort_order')->get();
        if ($questions->isEmpty()) {
            foreach (self::TEMPLATE as $index => [$section, $question]) {
                QuestionnaireQuestion::create(compact('section', 'question') + ['team_id' => $team->id, 'sort_order' => $index + 1]);
            }
            $questions = QuestionnaireQuestion::where('team_id', $team->id)->orderBy('sort_order')->get();
        }

        return response()->json(['questions' => $questions]);
    }

    public function updateQuestions(Request $request): JsonResponse
    {
        abort_unless($request->user()->role === 'capstone', 403);
        $team = Team::where('owner_id', $request->user()->id)->firstOrFail();
        $data = $request->validate([
            'questions' => ['required', 'array', 'min:1'],
            'questions.*.section' => ['nullable', 'string', 'max:255'],
            'questions.*.question' => ['required', 'string', 'max:1000'],
        ]);
        DB::transaction(function () use ($team, $data) {
            QuestionnaireQuestion::where('team_id', $team->id)->delete();
            foreach ($data['questions'] as $index => $item) {
                QuestionnaireQuestion::create([...$item, 'team_id' => $team->id, 'sort_order' => $index + 1]);
            }
        });

        return $this->questions($request);
    }

    public function mitraQuestions(Request $request, Team $team): JsonResponse
    {
        abort_unless($team->is_published, 404);
        $questions = QuestionnaireQuestion::where('team_id', $team->id)->orderBy('sort_order')->get();

        return response()->json(['team' => $team->only(['id', 'team_name', 'project_title']), 'questions' => $questions]);
    }

    public function answer(Request $request, Team $team): JsonResponse
    {
        abort_unless($team->is_published, 404);
        $questions = QuestionnaireQuestion::where('team_id', $team->id)->pluck('id');
        $data = $request->validate([
            'respondent_name' => ['required', 'string', 'max:255'],
            'respondent_address' => ['required', 'string', 'max:1000'],
            'respondent_affiliation' => ['nullable', 'in:internal_ti,external'],
            'answers' => ['required', 'array'],
            'answers.*' => ['required', 'integer', 'between:1,5'],
        ]);
        abort_unless(count($data['answers']) === $questions->count() && !array_diff($questions->all(), array_keys($data['answers'])), 422, 'Semua pertanyaan wajib dijawab.');

        DB::transaction(function () use ($team, $data) {
            $response = QuestionnaireResponse::create([
                'team_id' => $team->id,
                'user_id' => null,
                'respondent_role' => 'mitra',
                'respondent_name' => $data['respondent_name'],
                'respondent_address' => $data['respondent_address'],
                'respondent_affiliation' => $data['respondent_affiliation'] ?? null,
            ]);
            foreach ($data['answers'] as $questionId => $score) {
                QuestionnaireAnswer::updateOrCreate(['response_id' => $response->id, 'question_id' => $questionId], ['score' => $score]);
            }
        });

        return response()->json(['message' => 'Kuesioner berhasil disimpan.']);
    }
}
