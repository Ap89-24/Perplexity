export default function LoadingScreen() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
            <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-gray-700"></div>
                <div className="absolute top-0 left-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-purple-500 border-r-cyan-500"></div>
            </div>

            <h2 className="mt-6 text-xl font-semibold">
                Loading...
            </h2>

            <p className="mt-2 text-sm text-gray-400">
                Please wait while we prepare everything
            </p>
        </div>
    );
}