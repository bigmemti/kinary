export function orderedSections<
    T extends { id: number; parent_id: number | null },
>(sections: T[]): (T & { depth: number })[] {
    const result: (T & { depth: number })[] = [];
    const visited = new Set<number>();
    function visit(parent: number | null, depth: number) {
        for (const section of sections) {
            if (
                (section.parent_id == null
                    ? parent === null
                    : parent !== null &&
                      String(section.parent_id) === String(parent)) &&
                !visited.has(section.id)
            ) {
                visited.add(section.id);
                result.push({ ...section, depth });
                visit(section.id, depth + 1);
            }
        }
    }
    visit(null, 0);
    for (const section of sections) {
        if (!visited.has(section.id)) {
            visited.add(section.id);
            result.push({ ...section, depth: 0 });
            visit(section.id, 1);
        }
    }
    return result;
}

export type NestedSection<T> = T & { children: NestedSection<T>[] };

export function nestedSections<T extends { depth: number }>(
    sections: T[],
): NestedSection<T>[] {
    const roots: NestedSection<T>[] = [];
    const ancestors: NestedSection<T>[] = [];

    for (const section of sections) {
        const node: NestedSection<T> = { ...section, children: [] };
        while (ancestors.length > section.depth) {
            ancestors.pop();
        }
        const parent = ancestors.at(-1);
        (parent ? parent.children : roots).push(node);
        ancestors.push(node);
    }

    return roots;
}
