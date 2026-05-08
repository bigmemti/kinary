import { PropsWithChildren } from "react";

export function DashboardContainer({ children }: PropsWithChildren){
    return(
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            {children}
        </div>
    );
}