<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Override;

class Task extends Model
{
    use SoftDeletes;

    protected $fillable = ['user_id', 'title', 'description', 'status', 'priority', 'is_active', 'due_data'];

    #[Override]
    protected function casts()
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scope to find tasks that are past their due date and NOT completed
    public function scopeOverdue($qurey)
    {
        return $qurey->where('due_date', '<', now()->toDateString())->where('status', '!==', 'completed');
    }

    // Scope to find tasks due exactly today
    public function scopeDueToday($qurey)
    {
        return $qurey->where('due_date', now()->toDateString())->where('status', "!==", 'completed');
    }
}
