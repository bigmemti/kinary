import { router } from '@inertiajs/react';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useId,
    useRef,
    useState,
    type ReactNode,
} from 'react';

const EditorState = createContext<{
    dirty: boolean;
    busy: boolean;
    register: (id: string, dirty: boolean) => void;
}>({
    dirty: false,
    busy: false,
    register: () => {},
});

export function CourseEditorState({ children }: { children: ReactNode }) {
    const forms = useRef(new Map<string, boolean>());
    const locked = useRef(false);
    const [dirty, setDirty] = useState(false);
    const [busy, setBusy] = useState(false);
    const register = useCallback((id: string, changed: boolean) => {
        if (changed) forms.current.set(id, true);
        else forms.current.delete(id);
        setDirty(forms.current.size > 0);
    }, []);

    useEffect(() => {
        const before = router.on('before', ({ detail: { visit } }) => {
            if (visit.method !== 'get') {
                if (locked.current) return false;
                locked.current = true;
                setBusy(true);
            } else if (!visit.prefetch) {
                if (locked.current) return false;
                if (
                    forms.current.size &&
                    !(
                        visit.preserveState &&
                        visit.url.pathname === window.location.pathname
                    )
                ) {
                    return window.confirm(
                        'تغییرات ذخیره‌نشده دارید. از ویرایشگر خارج شوید؟',
                    );
                }
            }
        });
        const finish = router.on('finish', ({ detail: { visit } }) => {
            if (visit.method !== 'get') {
                locked.current = false;
                setBusy(false);
            }
        });
        const unload = (event: BeforeUnloadEvent) => {
            if (forms.current.size || locked.current) {
                event.preventDefault();
                event.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', unload);
        return () => {
            before();
            finish();
            window.removeEventListener('beforeunload', unload);
        };
    }, []);

    return (
        <EditorState.Provider value={{ dirty, busy, register }}>
            {children}
        </EditorState.Provider>
    );
}

export function useCourseEditorState() {
    return useContext(EditorState);
}

export function useCourseEditorDirty(dirty: boolean) {
    const id = useId();
    const { register } = useCourseEditorState();
    useEffect(() => {
        register(id, dirty);
        return () => register(id, false);
    }, [id, dirty, register]);
}
