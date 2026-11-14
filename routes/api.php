<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TodoController;
use App\Http\Controllers\ProjectController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::apiResource('todos', TodoController::class);
Route::get('projects/stats', [ProjectController::class, 'stats']);
Route::get('projects/categories', [ProjectController::class, 'categories']);
Route::get('projects/votes', [ProjectController::class, 'votes']);
Route::get('projects', [ProjectController::class, 'index']);
Route::get('projects/{team}', [ProjectController::class, 'show']);
