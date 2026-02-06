import { Skeleton } from "@/components/ui/skeleton";

const HomeSkeleton = () => {
  return (
    <section className="w-full max-w-7xl mx-auto flex flex-col gap-6 min-h-[86vh] items-center justify-center">
      <div className="text-8xl font-bold mx-auto">
        <Skeleton className="w-full h-20" />
      </div>
    </section>
  );
};

export default HomeSkeleton;
