
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const OutlineLoading = () => {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-3/4 bg-dark-300 mb-6" />
      {[1, 2, 3, 4].map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className="h-6 w-1/2 bg-dark-300" />
          <div className="pl-6 space-y-2">
            {[1, 2, 3].map((_, idx) => (
              <Skeleton key={idx} className="h-4 w-5/6 bg-dark-300" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OutlineLoading;
