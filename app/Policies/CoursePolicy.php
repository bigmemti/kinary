<?php

namespace App\Policies;

use App\Enums\TeacherRole;
use App\Models\Course;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CoursePolicy
{
    public function manageEditorCommerce(User $user, Course $course): Response
    {
        return $this->authorizeCourseRole($user, $course, [TeacherRole::Owner]);
    }

    public function updateEditorStructure(User $user, Course $course): Response
    {
        return $this->authorizeCourseRole($user, $course, [TeacherRole::Owner, TeacherRole::Instructor, TeacherRole::Editor]);
    }

    public function deleteEditorStructure(User $user, Course $course): Response
    {
        return $this->authorizeCourseRole($user, $course, [TeacherRole::Owner, TeacherRole::Editor]);
    }

    public function updateEditorInformation(User $user, Course $course): Response
    {
        return $this->authorizeCourseRole($user, $course, [TeacherRole::Owner, TeacherRole::Editor]);
    }

    public function publishEditorCourse(User $user, Course $course): Response
    {
        return $this->authorizeCourseRole($user, $course, [TeacherRole::Owner]);
    }

    public function manageEditorTeachers(User $user, Course $course): Response
    {
        return $this->authorizeCourseRole($user, $course, [TeacherRole::Owner]);
    }

    /**
     * @param  list<TeacherRole>  $roles
     */
    private function authorizeCourseRole(User $user, Course $course, array $roles): Response
    {
        if (! $user->hasRole('teacher')) {
            return Response::denyAsNotFound();
        }

        $role = $course->teachers()->where('teachers.user_id', $user->id)->value('course_teacher.role');

        if ($role === null) {
            return Response::denyAsNotFound();
        }

        return in_array(TeacherRole::tryFrom($role), $roles, true)
            ? Response::allow()
            : Response::deny();
    }

    public function viewEditor(User $user, Course $course): Response
    {
        if (! $user->hasRole('teacher')) {
            return Response::denyAsNotFound();
        }

        return $course->teachers()->where('teachers.user_id', $user->id)->exists()
            ? Response::allow()
            : Response::denyAsNotFound();
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Course $course): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Course $course): bool
    {
        return true;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Course $course): bool
    {
        return true;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Course $course): bool
    {
        return true;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Course $course): bool
    {
        return true;
    }
}
