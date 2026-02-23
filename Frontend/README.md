# Project Tool - Frontend Dashboard

A modern, responsive React Single Page Application (SPA) providing a fast, responsive user interface for the Project Management Tool backend. Built with Vite and React.

---

## 🚀 Features

- **Blazing Fast**: Powered by Vite and React.
- **Modern UI Styling**: Complete visual structure heavily utilizing Tailwind CSS for a premium SaaS feel.
- **Responsive Navigation**: Adaptable dashboard structures that work across viewports.
- **Standalone Modules**: Incorporates decoupled features designed for extreme modularity.

---

## 📋 Audit Log Dashboard (Standalone Module)

A completely decoupled, React-based dashboard was recently integrated to handle Activity Tracking.

### Module Capabilities
1. **Mock-Data Driven**: Operates flawlessly entirely on frontend states using `mockData.js`, enforcing strict decoupling from APIs.
2. **Comprehensive Filters**: Search logs chronologically, by semantic actions (like `CREATE_PROJECT`), or narrow down to successes/failures.
3. **Graceful UI States**: Includes specialized `<SkeletonTable />`, `<EmptyState />`, and `<ErrorState />` components.
4. **Pagination**: Native array slicing to traverse large lists without fetching new data.

It is currently mounted via `<AuditLogDashboard />` under `src/pages/AuditLog/` and can be dropped anywhere in the standard router setup.

*For more details on dropping it into a specific route, read [`AuditLog-Setup.md`](./AuditLog-Setup.md).*

---

## 📅 Activity History Timeline (Standalone Module)

A stunning, responsive vertical timeline designed to map project user activities (`create`, `update`, `status`, etc.). Built intentionally decoupled from existing API requirements.

### Module Capabilities
1. **Zero-Config Backend Dependency**: Renders entirely on mock data via `ActivityTimeline/mockData.js`, acting as a plug-and-play UI feature.
2. **Infinite Scroll Dynamics**: Built-in IntersectionObserver natively paginates the timeline entries mimicking API network latency.
3. **Smart Filters**: Fast `<select>` categorization based on `actionType` to isolate creations, updates, assignments, etc.
4. **Visual Polish**: Includes custom SVG Action Icons, beautiful empty states, and built-in animated loading skeletons for maximum UX.

It is currently housed under `src/components/ActivityTimeline/` and can be utilized anywhere for project overviews.

*For instructions on linking this with backend Express routes, read `ActivityHistory-Setup.md`.*

---

## 🛠 Tech Stack

- **Framework**: React 18
- **Tooling**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (General app layout)
