<?php

namespace App\Observers;

use App\Models\Teacher;
use App\Models\User;

class TeacherObserver
{
    /**
     * Handle the Teacher "created" event.
     */
    public function created(Teacher $teacher): void
    {
        $teacher->user()->first()?->assignRole('teacher');
    }

    /**
     * Handle the Teacher "updated" event.
     */
    public function updated(Teacher $teacher): void
    {
        if ($teacher->wasChanged('user_id')) {
            User::find($teacher->getOriginal('user_id'))?->removeRole('teacher');
            $teacher->user()->first()?->assignRole('teacher');
        }
    }

    /**
     * Handle the Teacher "deleted" event.
     */
    public function deleted(Teacher $teacher): void
    {
        $teacher->user()->first()?->removeRole('teacher');
    }
}
