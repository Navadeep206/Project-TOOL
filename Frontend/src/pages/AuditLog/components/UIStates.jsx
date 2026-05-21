import React from 'react';

export const SkeletonTable = () => {
    return (
        <div className="animate-pulse flex flex-col gap-4 w-full">
            <div className="h-10 bg-zinc-900 border border-zinc-800 rounded-sm w-full mb-4"></div>
            {[...Array(5)].map((_, idx) => (
                <div key={idx} className="flex gap-4">
                    <div className="h-12 bg-zinc-900 border border-zinc-800 rounded-sm w-1/4"></div>
                    <div className="h-12 bg-zinc-900 border border-zinc-800 rounded-sm w-1/4"></div>
                    <div className="h-12 bg-zinc-900 border border-zinc-800 rounded-sm w-1/4"></div>
                    <div className="h-12 bg-zinc-900 border border-zinc-800 rounded-sm w-1/4"></div>
                </div>
            ))}
        </div>
    );
};

export const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-6 bg-zinc-950/50 rounded-sm border border-dashed border-zinc-800">
        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800">
            <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>
        <h3 className="text-lg font-bold text-zinc-300 mb-1 uppercase tracking-wide">No audit logs found</h3>
        <p className="text-sm font-mono text-zinc-500 text-center max-w-md">
            We couldn't find any activity matching your current filters. Try changing your search terms or selecting a different data type.
        </p>
    </div>
);

export const ErrorState = ({ message }) => (
    <div className="p-6 bg-red-950/30 border border-red-900/50 rounded-sm flex items-start gap-4">
        <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-red-400">Error loading audit logs</h3>
            <div className="mt-2 text-sm font-mono text-red-300/80">
                <p>{message || "An unexpected error occurred. Please try again later."}</p>
            </div>
        </div>
    </div>
);
