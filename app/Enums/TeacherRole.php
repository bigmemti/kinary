<?php

namespace App\Enums;

enum TeacherRole: string
{
    case Owner = 'owner';
    case Instructor = 'instructor';
    case Assistant = 'assistant';
    case Reviewer = 'reviewer';
    case Editor = 'editor';
}
