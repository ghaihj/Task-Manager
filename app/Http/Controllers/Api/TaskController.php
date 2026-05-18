<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{

    public function index(Request $request)
    {
        $query = $request->user()->tasks();

        // Search By Title Or Description
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        // 3. SMART DEADLINE FILTERS (By our Model Scopes)
        if ($request->has('deadline')) {
            if ($request->deadline === 'overdue') $query->overdue();
            if ($request->deadline === 'due_today') $query->dueToday();
        }

        // 4. SORTING Feature (Default: newest first, but can sort by due_date, etc.)
        $sortBy = $request->get('sort_by', 'created_at'); // what to sort by
        $sortDir = $request->get('sort_dir', 'desc');     // asc or desc
        $query->orderBy($sortBy, $sortDir);

        // 5. PAGINATION Feature (10 tasks per page instead of getting all)
        $perPage = $request->get('per_page', 10);
        $tasks = $query->paginate($perPage);

        return TaskResource::collection($query->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'in:pending,in_progress,completed',
            'priority' => 'in:low,medium,high',
            'is_active' => 'boolean',
            'due_date' => 'nullable|date',
        ]);

        $task = $request->user()->tasks()->create($validated);

        return new TaskResource($task);
    }

    public function show(Task $task)
    {
        if ($task->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return new TaskResource($task);
    }

    public function update(Request $request, Task $task)
    {
        if ($task->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:pending,in_progress,completed',
            'priority' => 'sometimes|in:low,medium,high',
            'is_active' => 'sometimes|boolean',
            'due_date' => 'nullable|date',
        ]);

        $task->update($validated);

        return new TaskResource($task);
    }

    public function destroy(Task $task)
    {
        if ($task->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $task->delete();  // Soft Deletes

        return response()->json(['message' => 'Task moved to trash successfully']);
    }

    // Get:List All Tasks Trashed 

    public function trashed(Request $request)
    {
        $trashedTasks = $request->user()->tasks()->onlyTrashed()->latest()->get();

        return TaskResource::collection($trashedTasks);
    }

    // Patch: Restore a task from the trash

    public function restore(Request $request, string $id)
    {
        $task = $request->user()->tasks()->withTrashed()->findOrFail($id);

        $task->restore();

        return response()->json(['message' => 'Task restored successfully', 'task' => new TaskResource($task)]);
    }

    public function forceDelete(Request $request, string $id)
    {
        $task = $request->user()->tasks()->withTrashed()->findOrFail($id);

        $task->forceDelete();

        return response()->json(['message' => 'Task permanently deleted']);
    }

    // PATCH: Mark multiple tasks as completed
    public function bulkComplete(Request $request)
    {
        $request->validate([
            'task_ids' => 'required|array',
            'task_ids.*' => 'integer|exists:tasks,id'
        ]);

        $request->user()->tasks()->whereIn('id', $request->task_ids)->update(['status' => 'completed']);

        return response()->json(['message' => 'Selected tasks marked as completed']);
    }

    // DELETE: Soft delete multiple tasks at once
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'task_ids' => 'required|array',
            'task_ids.*' => 'integer|exists:tasks,id'
        ]);

        $request->user()->tasks()->whereIn('id', $request->task_ids)->delete();

        return response()->json(['message' => 'Selected tasks moved to trash']);
    }
}
