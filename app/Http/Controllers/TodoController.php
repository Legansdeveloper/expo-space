<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;

class TodoController extends Controller
{
    public function index()
    {
        return response()->json(Todo::latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'completed' => ['sometimes', 'boolean'],
        ]);

        $todo = Todo::create($validated);

        return response()->json($todo, 201);
    }

    public function show(Todo $todo)
    {
        return response()->json($todo);
    }

    public function update(Request $request, Todo $todo)
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'completed' => ['sometimes', 'boolean'],
        ]);

        $todo->update($validated);

        return response()->json($todo->fresh());
    }

    public function destroy(Todo $todo)
    {
        $todo->delete();

        return response()->noContent();
    }
}
