import { LoadingAnimation } from "../components/ui/loading-animation";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingAnimation size="large" showText={true} />
    </div>
  );
}
