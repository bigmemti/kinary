<?php

use App\Enums\TeacherRole;
use App\Models\Access;
use App\Models\Category;
use App\Models\Content;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Plan;
use App\Models\Section;
use App\Models\Space;
use App\Models\Teacher;
use App\Models\User;
use App\Services\SectionTree;
use Inertia\Testing\AssertableInertia as Assert;

test('administrators manage category descriptions and public category displays them', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $this->actingAs($admin)->post(route('admin.category.store'), ['name' => 'PHP', 'description' => 'Category information'])->assertRedirect(route('admin.category.index'));
    $category = Category::where('name', 'PHP')->sole();
    $this->get(route('category.show', $category->slug))->assertInertia(fn (Assert $page) => $page->where('category.description', 'Category information'));
    $this->put(route('admin.category.update', $category), ['name' => 'PHP', 'slug' => $category->slug, 'description' => 'Updated'])->assertRedirect();
    $this->assertDatabaseHas('categories', ['id' => $category->id, 'description' => 'Updated']);
    $this->delete(route('admin.category.destroy', $category))->assertRedirect();
    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});

test('public teacher page and sitemap include only published teaching courses', function () {
    $teacher = Teacher::factory()->create(['description' => 'Teacher information']);
    $published = Course::factory()->create(['is_published' => true]);
    $draft = Course::factory()->create(['is_published' => false]);
    $published->teachers()->attach($teacher, ['role' => TeacherRole::Instructor]);
    $draft->teachers()->attach($teacher, ['role' => TeacherRole::Owner]);
    $this->get(route('teacher.show', $teacher))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('teacher.description', 'Teacher information')->has('courses', 1)->where('courses.0.id', $published->id));
    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page->where('teachers.0.description', 'Teacher information'));
    $this->get('/sitemap.xml')->assertSee(route('teacher.show', $teacher), false);
});

test('section parent must belong to the course and cannot create a cycle', function () {
    $course = Course::factory()->create();
    $teacher = Teacher::factory()->create();
    $course->teachers()->attach($teacher, ['role' => TeacherRole::Owner]);
    $parent = Section::factory()->for($course)->create(['order' => 1]);
    $child = Section::factory()->for($course)->create(['order' => 2, 'parent_id' => $parent->id]);
    $other = Section::factory()->for(Course::factory())->create(['order' => 1]);
    $this->actingAs($teacher->user)->put(route('teacher.section.update', $parent), ['name' => $parent->name, 'order' => 1, 'parent_id' => $child->id])->assertSessionHasErrors('parent_id');
    $this->put(route('teacher.section.update', $parent), ['name' => $parent->name, 'order' => 1, 'parent_id' => $other->id])->assertSessionHasErrors('parent_id');
    $this->assertDatabaseHas('sections', ['id' => $parent->id, 'parent_id' => null]);
});

test('the course editor saves and reloads a section parent and can move it back to the root', function () {
    $course = Course::factory()->create();
    $teacher = Teacher::factory()->create();
    $course->teachers()->attach($teacher, ['role' => TeacherRole::Owner]);
    $parent = Section::factory()->for($course)->create(['name' => 'Parent', 'order' => 1]);
    $child = Section::factory()->for($course)->create(['name' => 'Child', 'order' => 2]);

    $this->actingAs($teacher->user)->put(route('teacher.section.update', $child), [
        'name' => $child->name, 'order' => $child->order, 'parent_id' => (string) $parent->id,
    ])->assertRedirect(route('teacher.course.editor', $course))->assertSessionHasNoErrors();
    $this->assertDatabaseHas('sections', ['id' => $child->id, 'parent_id' => $parent->id]);
    $this->get(route('teacher.course.editor', $course))->assertInertia(fn (Assert $page) => $page
        ->loadDeferredProps(fn (Assert $reload) => $reload
            ->where('overview.sections.1.id', $child->id)->where('overview.sections.1.parent_id', $parent->id)));

    $this->put(route('teacher.section.update', $child), [
        'name' => $child->name, 'order' => $child->order, 'parent_id' => null,
    ])->assertSessionHasNoErrors();
    $this->assertDatabaseHas('sections', ['id' => $child->id, 'parent_id' => null]);
});

test('administrator can create a nested section and cannot create a cycle', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $course = Course::factory()->create();
    $parent = Section::factory()->for($course)->create(['order' => 1]);
    $this->actingAs($admin)->post(route('admin.course.section.store', $course), ['name' => 'Child', 'parent_id' => $parent->id])->assertSessionHasNoErrors();
    $child = Section::where('name', 'Child')->sole();
    expect($child->parent_id)->toBe($parent->id);
    $this->put(route('admin.section.update', $parent), ['name' => $parent->name, 'course_id' => $course->id, 'parent_id' => $child->id])->assertSessionHasErrors('parent_id');
});

test('visible section order includes empty ancestors but excludes unrelated empty sections', function () {
    $sections = [
        ['id' => 1, 'parent_id' => null, 'lessons' => []],
        ['id' => 2, 'parent_id' => 1, 'lessons' => [['id' => 7]]],
        ['id' => 3, 'parent_id' => null, 'lessons' => []],
    ];
    expect(app(SectionTree::class)->visible($sections))->toBe([
        [...$sections[0], 'depth' => 0],
        [...$sections[1], 'depth' => 1],
    ]);
});

test('public course and study outline show ancestors of accessible nested lessons', function () {
    $student = User::factory()->create();
    $course = Course::factory()->create(['is_published' => true]);
    $space = Space::factory()->for($course)->create();
    $plan = Plan::factory()->for($space)->create();
    $parent = Section::factory()->for($course)->create(['order' => 1]);
    $child = Section::factory()->for($course)->create(['order' => 2, 'parent_id' => $parent->id]);
    $lesson = Lesson::factory()->for($child)->create(['order' => 1]);
    $content = Content::factory()->text()->for($lesson)->create(['order' => 1]);
    Access::create(['plan_id' => $plan->id, 'content_id' => $content->id]);
    $student->student->plans()->attach($plan, ['is_active' => true]);

    $this->get(route('course.show', $course->slug))->assertInertia(fn (Assert $page) => $page
        ->where('spaces.0.sections.0.id', $parent->id)->where('spaces.0.sections.0.depth', 0)
        ->where('spaces.0.sections.1.id', $child->id)->where('spaces.0.sections.1.depth', 1)
        ->where('spaces.0.sections.1.lessons.0.id', $lesson->id));
    $this->actingAs($student)->get(route('student.study.lesson', [$space, $lesson]))->assertInertia(fn (Assert $page) => $page
        ->where('sections.0.id', $parent->id)->where('sections.1.id', $child->id)
        ->where('sections.1.depth', 1)->where('sections.1.lessons.0.id', $lesson->id));
});
