<?php

namespace App\Enums;

enum ProgressStatus: string
{
    case Unread = 'unread';
    case Read = 'read';
    case Cloned = 'cloned';
}
