<?php

namespace App\Console\Commands;

use App\Services\QuizService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('quiz:finish-expired')]
#[Description('Finish expired quiz attempts using their saved answers')]
class FinishExpiredQuizAttempts extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(QuizService $service): int
    {
        $service->finishExpiredAttempts();

        return self::SUCCESS;
    }
}
