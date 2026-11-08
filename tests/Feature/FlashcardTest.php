<?php

use App\Models\Access;
use App\Models\Content;
use App\Models\Course;
use App\Models\Deck;
use App\Models\Lesson;
use App\Models\Plan;
use App\Models\Section;
use App\Models\Space;
use App\Models\User;
use Illuminate\Support\Facades\DB;

test('student imports selected accessible cards and reviews only when due', function () {
    $this->freezeTime();
    $user = User::factory()->create();
    $course = Course::factory()->create();
    $space = Space::factory()->for($course)->create();
    $plan = Plan::factory()->for($space)->create();
    $lesson = Lesson::factory()->for(Section::factory()->for($course)->create(['order' => 1]))->create(['order' => 1]);
    $deck = new Deck;
    $deck->name = 'Source';
    $deck->save();
    $cardId = DB::table('cards')->insertGetId(['deck_id' => $deck->id, 'question' => 'Question', 'answer' => 'Answer', 'created_at' => now(), 'updated_at' => now()]);
    $content = Content::factory()->for($lesson)->create(['order' => 1, 'contentable_type' => Deck::class, 'contentable_id' => $deck->id]);
    Access::create(['plan_id' => $plan->id, 'content_id' => $content->id]);
    $user->student->plans()->attach($plan, ['is_active' => true]);
    $this->actingAs($user)->post(route('student.flashcards.import', [$space, $content]), ['new_deck_name' => 'Mine', 'cards' => [$cardId]])->assertSessionHasNoErrors();
    $personal = DB::table('cards')->where('source_card_id', $cardId)->first();
    expect($personal->question)->toBe('Question');
    $this->post(route('student.flashcards.review', $personal->id), ['correct' => true])->assertRedirect();
    $this->assertDatabaseHas('card_student', ['card_id' => $personal->id, 'student_id' => $user->student->id, 'box' => 2, 'due_at' => now()->addDay()->toDateTimeString()]);
    $this->post(route('student.flashcards.review', $personal->id), ['correct' => true])->assertStatus(422);
    $this->travel(1)->days();
    $this->post(route('student.flashcards.review', $personal->id), ['correct' => false])->assertRedirect();
    $this->assertDatabaseHas('card_student', ['card_id' => $personal->id, 'student_id' => $user->student->id, 'box' => 1, 'due_at' => now()->addDay()->toDateTimeString()]);
    $this->assertDatabaseHas('activity_logs', ['event' => 'flashcard.reviewed']);
});

test('students cannot review another students card', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $deck = DB::table('decks')->insertGetId(['name' => 'Mine', 'is_personal' => true, 'created_at' => now(), 'updated_at' => now()]);
    DB::table('deck_student')->insert(['deck_id' => $deck, 'student_id' => $owner->student->id, 'created_at' => now(), 'updated_at' => now()]);
    $card = DB::table('cards')->insertGetId(['deck_id' => $deck, 'question' => 'Question', 'answer' => 'Answer', 'created_at' => now(), 'updated_at' => now()]);
    DB::table('card_student')->insert(['card_id' => $card, 'student_id' => $owner->student->id, 'box' => 1, 'due_at' => now(), 'created_at' => now(), 'updated_at' => now()]);
    $this->actingAs($other)->post(route('student.flashcards.review', $card), ['correct' => true])->assertNotFound();
    $this->assertDatabaseHas('card_student', ['card_id' => $card, 'student_id' => $owner->student->id, 'box' => 1]);
});
