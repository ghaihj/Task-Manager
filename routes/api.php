<?php

use App\Http\Controllers\Api\AdminMailController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post("/register", [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // --- NEW: Bulk Action Routes ---
    Route::patch('/tasks/bulk-complete', [TaskController::class, 'bulkComplete']);
    Route::delete('/tasks/bulk-delete', [TaskController::class, 'bulkDelete']);

    // For Soft Deletes
    Route::get('/tasks/trashed', [TaskController::class, 'trashed']);
    Route::patch('/tasks/{id}/restore', [TaskController::class, 'restore']);
    Route::delete('/tasks/{id}/force', [TaskController::class, 'forceDelete']);


    // Routes For Admin
    Route::middleware('admin')->prefix('/admin')->group(function () {
        Route::post('/mail/user/{user}', [AdminMailController::class, 'sendToOneUser']);
        Route::post('/mail/broadcast', [AdminMailController::class, 'sendToAllUsers']);
    });


    Route::apiResource('tasks', TaskController::class);
});
