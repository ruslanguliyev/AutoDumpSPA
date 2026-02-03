import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

const RouteErrorBoundary = () => {
  const error = useRouteError();

  let title = 'Something went wrong';
  let message = 'Please try again later.';

  if (isRouteErrorResponse(error)) {
    title = error.statusText || 'Page error';
    message = error.data?.message || message;
  } else if (error instanceof Error) {
    message = error.message || message;
  } else if (typeof error === 'string') {
    message = error;
  }

  return (
    <div className="w-full px-4 py-10">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-sm text-destructive">
          <div className="font-semibold">{title}</div>
          <div className="mt-1">{message}</div>
        </div>
      </div>
    </div>
  );
};

export default RouteErrorBoundary;
