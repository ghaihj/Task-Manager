<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'priority' => $this->priority,
            'is_active' => $this->is_active,
            'due_date' => $this->due_date,
            'created_at' => $this->created_at->diffForHumans(),
            'deleted_at' => $this->deleted_at ? $this->deleted_at->diffForHumans() : null,
        ];
    }
}
