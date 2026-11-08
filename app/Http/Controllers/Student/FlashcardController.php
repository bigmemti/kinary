<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Content;
use App\Models\Deck;
use App\Models\Space;
use App\Services\ActivityLogger;
use App\Services\StudyService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class FlashcardController extends Controller
{
    private function decks(int $studentId)
    {
        return DB::table('decks')->where('is_personal', true)
            ->whereIn('id', DB::table('deck_student')->where('student_id', $studentId)->select('deck_id'));
    }

    public function index(Request $request): Response
    {
        $studentId = $request->user()->student->id;
        $decks = $this->decks($studentId)->orderBy('id')->get();
        $cards = DB::table('cards')->join('card_student', 'card_student.card_id', '=', 'cards.id')
            ->where('card_student.student_id', $studentId)->whereIn('cards.deck_id', $decks->pluck('id'))
            ->select('cards.id', 'cards.deck_id', 'cards.question', 'cards.answer', 'card_student.box', 'card_student.due_at')->orderBy('cards.id')->get();

        return inertia('student/flashcards/index', ['decks' => $decks->map(fn ($deck) => [
            'id' => $deck->id, 'name' => $deck->name, 'cards' => $cards->where('deck_id', $deck->id)->values(),
        ])]);
    }

    public function today(Request $request): Response
    {
        $studentId = $request->user()->student->id;
        $cards = DB::table('cards')->join('card_student', 'card_student.card_id', '=', 'cards.id')
            ->join('decks', 'decks.id', '=', 'cards.deck_id')
            ->where('card_student.student_id', $studentId)->whereIn('decks.id', $this->decks($studentId)->select('id'))
            ->where('card_student.due_at', '<=', now())->orderBy('card_student.due_at')
            ->select('cards.id', 'cards.question', 'cards.answer', 'decks.name as deck_name')->get();

        return inertia('student/flashcards/today', ['cards' => $cards]);
    }

    private function createDeck(int $studentId, string $name): int
    {
        $now = now();
        $id = DB::table('decks')->insertGetId(['name' => $name, 'is_personal' => true, 'created_at' => $now, 'updated_at' => $now]);
        DB::table('deck_student')->insert(['deck_id' => $id, 'student_id' => $studentId, 'created_at' => $now, 'updated_at' => $now]);
        app(ActivityLogger::class)->record('flashcard.deck.created', properties: ['attributes' => ['id' => $id, 'student_id' => $studentId, 'name' => $name]]);

        return $id;
    }

    private function createCard(int $studentId, int $deckId, string $question, string $answer, ?int $sourceId = null): void
    {
        $now = now();
        $attributes = ['deck_id' => $deckId, 'source_card_id' => $sourceId, 'question' => $question, 'answer' => $answer, 'created_at' => $now, 'updated_at' => $now];
        $id = DB::table('cards')->insertGetId($attributes);
        $state = ['card_id' => $id, 'student_id' => $studentId, 'box' => 1, 'due_at' => $now, 'created_at' => $now, 'updated_at' => $now];
        DB::table('card_student')->insert($state);
        app(ActivityLogger::class)->record($sourceId ? 'flashcard.card.imported' : 'flashcard.card.created', properties: ['attributes' => ['id' => $id, ...$attributes], 'state' => $state]);
    }

    public function storeDeck(Request $request): RedirectResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:255']]);
        DB::transaction(fn () => $this->createDeck($request->user()->student->id, $data['name']));

        return back();
    }

    public function import(Request $request, Space $space, Content $content, StudyService $study): RedirectResponse
    {
        $study->authorizeContent($request->user(), $space, $content);
        abort_unless($content->contentable_type === Deck::class, 404);
        $data = $request->validate(['deck_id' => ['nullable', 'integer'], 'new_deck_name' => ['nullable', 'string', 'max:255', 'required_without:deck_id'], 'cards' => ['required', 'array', 'min:1', 'max:200'], 'cards.*' => ['required', 'integer', 'distinct']]);
        DB::transaction(function () use ($request, $content, $data): void {
            $studentId = $request->user()->student->id;
            $source = $content->contentable->cards()->whereIn('id', $data['cards'])->get();
            abort_unless($source->count() === count($data['cards']), 422);
            if (! empty($data['deck_id'])) {
                $deck = $this->decks($studentId)->where('id', $data['deck_id'])->lockForUpdate()->first();
                abort_unless($deck, 404);
                $deckId = $deck->id;
            } else {
                $deckId = $this->createDeck($studentId, $data['new_deck_name']);
            }
            foreach ($source as $card) {
                if (! DB::table('cards')->where('deck_id', $deckId)->where('source_card_id', $card->id)->exists()) {
                    $this->createCard($studentId, $deckId, $card->question, $card->answer, $card->id);
                }
            }
        });

        return back();
    }

    public function storeCard(Request $request, int $deck): RedirectResponse
    {
        $data = $request->validate(['question' => ['required', 'string', 'max:65000'], 'answer' => ['required', 'string', 'max:65000']]);
        DB::transaction(function () use ($request, $deck, $data): void {
            $studentId = $request->user()->student->id;
            abort_unless($this->decks($studentId)->where('id', $deck)->lockForUpdate()->first(), 404);
            $this->createCard($studentId, $deck, $data['question'], $data['answer']);
        });

        return back();
    }

    public function destroyCard(Request $request, int $card): RedirectResponse
    {
        DB::transaction(function () use ($request, $card): void {
            $studentId = $request->user()->student->id;
            $row = DB::table('cards')->where('id', $card)->whereIn('deck_id', $this->decks($studentId)->select('id'))->lockForUpdate()->first();
            abort_unless($row && DB::table('card_student')->where('card_id', $card)->where('student_id', $studentId)->exists(), 404);
            $state = DB::table('card_student')->where('card_id', $card)->where('student_id', $studentId)->get()->toArray();
            DB::table('card_student')->where('card_id', $card)->where('student_id', $studentId)->delete();
            DB::table('cards')->where('id', $card)->delete();
            app(ActivityLogger::class)->recordChanges('flashcard.card.deleted', ['card' => (array) $row, 'state' => $state], []);
        });

        return back();
    }

    public function destroyDeck(Request $request, int $deck): RedirectResponse
    {
        DB::transaction(function () use ($request, $deck): void {
            $studentId = $request->user()->student->id;
            $row = $this->decks($studentId)->where('id', $deck)->lockForUpdate()->first();
            abort_unless($row, 404);
            $cards = DB::table('cards')->where('deck_id', $deck)->get();
            $states = DB::table('card_student')->whereIn('card_id', $cards->pluck('id'))->get();
            DB::table('card_student')->whereIn('card_id', $cards->pluck('id'))->delete();
            DB::table('cards')->where('deck_id', $deck)->delete();
            DB::table('deck_student')->where('deck_id', $deck)->delete();
            DB::table('decks')->where('id', $deck)->delete();
            app(ActivityLogger::class)->recordChanges('flashcard.deck.deleted', ['deck' => (array) $row, 'cards' => $cards->toArray(), 'states' => $states->toArray()], []);
        });

        return back();
    }

    public function review(Request $request, int $card): RedirectResponse
    {
        $data = $request->validate(['correct' => ['required', 'boolean']]);
        DB::transaction(function () use ($request, $card, $data): void {
            $studentId = $request->user()->student->id;
            $row = DB::table('card_student')->where('card_id', $card)->where('student_id', $studentId)
                ->whereIn('card_id', DB::table('cards')->whereIn('deck_id', $this->decks($studentId)->select('id'))->select('id'))->lockForUpdate()->first();
            abort_unless($row, 404);
            abort_if($row->due_at === null || now()->lt($row->due_at), 422);
            $intervals = [1 => 1, 2 => 2, 3 => 4, 4 => 8, 5 => 16, 6 => 32];
            $box = $data['correct'] ? min(6, $row->box + 1) : 1;
            $now = now();
            $after = ['box' => $box, 'due_at' => $now->copy()->addDays($data['correct'] ? $intervals[$row->box] : 1), 'reviewed_at' => $now, 'updated_at' => $now];
            DB::table('card_student')->where('card_id', $card)->where('student_id', $studentId)->update($after);
            app(ActivityLogger::class)->recordChanges('flashcard.reviewed', (array) $row, [...(array) $row, ...$after]);
        });

        return back();
    }
}
