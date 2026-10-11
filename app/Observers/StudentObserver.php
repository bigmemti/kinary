<?php

namespace App\Observers;

use App\Models\Student;
use App\Models\User;

class StudentObserver
{
    /**
     * Handle the Student "created" event.
     */
    public function created(Student $student): void
    {
        $student->user()->first()?->assignRole('student');
    }

    /**
     * Handle the Student "updated" event.
     */
    public function updated(Student $student): void
    {
        if ($student->wasChanged('user_id')) {
            User::find($student->getOriginal('user_id'))?->removeRole('student');
            $student->user()->first()?->assignRole('student');
        }
    }

    /**
     * Handle the Student "deleted" event.
     */
    public function deleted(Student $student): void
    {
        $student->user()->first()?->removeRole('student');
    }
}
