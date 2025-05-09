import React from "react";
import { Outlet } from "react-router-dom";
import SidebarMenu from "../components/SidebarMenu";
import { ErrorBoundary } from "react-error-boundary";

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="p-4 text-red-500">
    <h2>Something went wrong:</h2>
    <pre>{error.message}</pre>
    <button
      onClick={resetErrorBoundary}
      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
    >
      Try Again
    </button>
  </div>
);

const MainLayout = () => {
  return (
    <div className="flex h-screen">
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => window.location.reload()}
      >
        <SidebarMenu />
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          <Outlet />
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default React.memo(MainLayout);
