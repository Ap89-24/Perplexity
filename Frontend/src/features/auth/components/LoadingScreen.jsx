export default function LoadingScreen() {
    return (
        <div className="chat-shell flex min-h-screen flex-col items-center justify-center">
            <div className="relative">
                <div className="h-10 w-10 rounded-full border-2 chat-border" />
                <div className="absolute left-0 top-0 h-10 w-10 animate-spin rounded-full border-2 border-transparent border-t-[var(--chat-accent)]" />
            </div>

            <h2 className="mt-5 text-[15px] font-medium">Loading Nexora</h2>
            <p className="mt-1 text-sm chat-text-muted">Please wait while we prepare everything</p>
        </div>
    );
}
