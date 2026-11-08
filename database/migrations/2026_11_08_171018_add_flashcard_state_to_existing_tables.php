<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
            Schema::table('decks', function (Blueprint $table): void {
                $table->boolean('is_personal')->default(false)->after('name');
            });

            Schema::table('cards', function (Blueprint $table): void {
                $table->foreignId('source_card_id')->nullable()->after('deck_id')->constrained('cards')->nullOnDelete();
                $table->unique(['deck_id', 'source_card_id'], 'cards_deck_source_unique');
            });

        Schema::table('card_student', function (Blueprint $table): void {
                $table->unsignedTinyInteger('box')->default(1);
                $table->timestamp('due_at')->nullable();
                $table->timestamp('reviewed_at')->nullable();

                $table->index(['student_id', 'due_at'], 'card_student_due_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('card_student', function (Blueprint $table): void {
            $table->dropColumn(['box', 'due_at', 'reviewed_at']);
        });
        Schema::table('cards', function (Blueprint $table): void {
            $table->dropUnique('cards_deck_source_unique');
            $table->dropConstrainedForeignId('source_card_id');
        });
        Schema::table('decks', function (Blueprint $table): void {
            $table->dropColumn('is_personal');
        });
    }
};
