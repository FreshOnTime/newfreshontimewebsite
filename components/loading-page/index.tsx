import Spinner from "@/components/spinner";

export default function LoadingPage() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center space-y-6 p-8 rounded-2xl">
        <div className="relative">
          <Spinner color="#22C55E" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">
            Preparing your fresh groceries
          </p>
        </div>
      </div>
    </div>
  );
}
