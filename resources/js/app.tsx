import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) =>
        title.endsWith(' | آکادمی')
            ? title
            : title
              ? `${title} - ${appName}`
              : appName,
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        document.documentElement.dir =
            props.initialPage.props.pageDirection === 'rtl' ? 'rtl' : 'ltr';
        router.on('navigate', (event) => {
            document.documentElement.dir =
                event.detail.page.props.pageDirection === 'rtl' ? 'rtl' : 'ltr';
        });
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
