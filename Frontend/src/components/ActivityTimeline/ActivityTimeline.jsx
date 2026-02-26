import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import ActivityItem from './ActivityItem';

/**
 * ActivityTimeline
 * Standalone UI Component for displaying Project Activity History.
 */
const ActivityTimeline = ({ projectId = "proj_test_123" }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filter, setFilter] = useState('all'); // all, create, update, delete, etc.

    const observer = useRef();

    // Infinite Scroll logic: ref callback to trigger loading more items
    const lastElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            // If the last element is visible and we still have more data, fetch next page
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    // Fetch from backend API natively
    useEffect(() => {
        const fetchActivities = async () => {
            setLoading(true);
            try {
                // You would pass the actual projectId dynamically in production
                const response = await axios.get(`http://localhost:5050/api/v1/activities/project/${projectId}`, {
                    params: { page, limit: 5, actionType: filter === 'all' ? undefined : filter },
                    withCredentials: true // Include HTTP-Only cookies if leveraging them
                });

                const fetchedActivities = response.data.data.activities || [];

                if (page === 1) {
                    setActivities(fetchedActivities);
                } else {
                    setActivities(prev => [...prev, ...fetchedActivities]);
                }

                setHasMore(fetchedActivities.length >= 5);
            } catch (error) {
                console.error("Failed to fetch activities:", error);

                // Fallback softly if the route isn't active right now
                setHasMore(false);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, [page, filter, projectId]);

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
        setPage(1); // Reset page to 1 when filter changes
        setActivities([]); // clear current activities
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl max-w-3xl w-full mx-auto font-mono text-slate-300">

            {/* Header & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-emerald-400">Project Activity</h2>
                    <p className="text-sm text-slate-500 mt-1">Recent timeline of all events and updates.</p>
                </div>

                {/* Simple Filter Dropdown */}
                <div className="relative">
                    <select
                        className="appearance-none bg-slate-800 border border-slate-700 text-slate-300 py-2 pl-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
                        value={filter}
                        onChange={handleFilterChange}
                    >
                        <option value="all">All Activities</option>
                        <option value="create">Creations</option>
                        <option value="update">Updates</option>
                        <option value="delete">Deletions</option>
                        <option value="status">Status Changes</option>
                        <option value="assign">Assignments</option>
                    </select>
                    {/* Custom chevron to replace default select arrow */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Timeline Content */}
            <div className="relative">
                {/* Empty State */}
                {!loading && activities.length === 0 && (
                    <div className="py-12 text-center text-slate-500">
                        <svg className="mx-auto h-12 w-12 text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>No activity found matching your criteria.</p>
                    </div>
                )}

                {/* Timeline Items List */}
                <div className="space-y-6">
                    {activities.map((activity, index) => {
                        const isLastElement = activities.length === index + 1;
                        // Only attach observer ref to the last element of the list
                        return (
                            <div ref={isLastElement ? lastElementRef : null} key={activity._id || index}>
                                <ActivityItem activity={activity} isLast={isLastElement && !hasMore} />
                            </div>
                        );
                    })}
                </div>

                {/* Loading Skeleton */}
                {loading && (
                    <div className="space-y-6 mt-6">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="flex gap-4 animate-pulse">
                                <div className="w-10 h-10 rounded-full bg-slate-800 shrink-0"></div>
                                <div className="flex-1 space-y-3 py-1">
                                    <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                                    <div className="h-3 bg-slate-800 rounded w-1/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityTimeline;
