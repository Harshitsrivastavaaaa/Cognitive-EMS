// Suspense fallback while a lazily loaded page downloads.
// fullScreen fills the viewport (public pages); otherwise it fills the layout's content area.
export default function PageLoader({ fullScreen = false }) {
    return (
        <div
            role="status"
            aria-live="polite"
            className={`flex flex-col items-center justify-center gap-4 bg-slate-50 ${fullScreen ? 'min-h-screen' : 'h-full min-h-[60vh] bg-transparent'}`}
        >
            <div className="w-9 h-9 rounded-full border-[3px] border-slate-200 border-t-blue-600 animate-spin" />
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-blue-600">Loading</p>
        </div>
    );
}
