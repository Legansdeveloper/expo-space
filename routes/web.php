<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CapstoneController;
use App\Http\Controllers\QuestionnaireController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::view('/login', 'welcome');
Route::view('/signup', 'welcome');
Route::view('/mitra/dashboard', 'welcome');
Route::view('/mitra/projects', 'welcome');
Route::view('/mitra/settings', 'welcome');
Route::view('/mitra/project/{projectId}', 'welcome');
Route::view('/mitra/questionnaire/{projectId}', 'welcome');
Route::view('/capstone/dashboard', 'welcome');
Route::view('/capstone/{section}', 'welcome')
    ->where('section', 'poster|landing-page|business-flow|application|preview|questionnaire');

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout']);
Route::middleware('auth')->group(function () {
    Route::get('/auth/profile', [AuthController::class, 'profile']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
});

Route::middleware('auth')->prefix('capstone/data')->group(function () {
    Route::get('/', [CapstoneController::class, 'data']);
    Route::post('/team', [CapstoneController::class, 'team']);
    Route::post('/publish', [CapstoneController::class, 'publish']);
    Route::post('/poster', [CapstoneController::class, 'poster']);
    Route::post('/component/{type}', [CapstoneController::class, 'component'])
        ->where('type', 'landing-page|business-flow|application');
    Route::delete('/component/{type}', [CapstoneController::class, 'destroy'])
        ->where('type', 'poster|landing-page|business-flow|application');
    Route::get('/questionnaire', [QuestionnaireController::class, 'questions']);
    Route::put('/questionnaire', [QuestionnaireController::class, 'updateQuestions']);
});

Route::prefix('mitra/data')->group(function () {
    Route::get('/questionnaire/{team}', [QuestionnaireController::class, 'mitraQuestions']);
    Route::post('/questionnaire/{team}', [QuestionnaireController::class, 'answer']);
});
