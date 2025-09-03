"use client";

export default function GlobalError({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-red-600">Oops!</h1>
            <h2 className="text-2xl font-semibold text-gray-700">
              Something went wrong!
            </h2>
            <p className="text-gray-500">
              We apologize for the inconvenience. Please try again.
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium 
                     hover:bg-red-700 transition-colors duration-200 
                     focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
