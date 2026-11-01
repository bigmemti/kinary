<?php

namespace App\Services;

class SectionTree
{
    /**
     * @param  list<array<string, mixed>>  $sections
     * @return list<array<string, mixed>>
     */
    public function visible(array $sections): array
    {
        $byId = collect($sections)->keyBy('id');
        $included = [];
        foreach ($sections as $section) {
            if ($section['lessons'] === []) {
                continue;
            }
            $current = $section;
            while ($current && ! isset($included[$current['id']])) {
                $included[$current['id']] = true;
                $current = $byId->get($current['parent_id'] ?? null);
            }
        }

        $ordered = [];
        $visit = function (?int $parentId, int $depth) use (&$visit, &$ordered, &$included, $sections): void {
            foreach ($sections as $section) {
                if (($section['parent_id'] ?? null) !== $parentId || ! isset($included[$section['id']])) {
                    continue;
                }
                unset($included[$section['id']]);
                $ordered[] = [...$section, 'depth' => $depth];
                $visit($section['id'], $depth + 1);
            }
        };
        $visit(null, 0);

        return $ordered;
    }
}
