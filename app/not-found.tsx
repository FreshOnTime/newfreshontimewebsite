import Link from "next/link";

export default async function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="flex items-center">
        <h2 className="text-2xl font-bold text-gray-900">404</h2>
        <div className="mx-4 w-[1px] h-8 bg-gray-500"></div>
        <p className="text-gray-500">Page not found</p>
      </div>
      <Link href="/" className="mt-4 text-green-500">
        Go back
      </Link>
    </div>
  );
}
