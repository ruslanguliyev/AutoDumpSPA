import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="w-full px-4 py-12">
      <div className="mx-auto flex w-full max-w-[640px] flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Page not found</h1>
        <p className="text-sm text-slate-500">
          This seller does not have a public dealer page.
        </p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Go to homepage
        </button>
      </div>
    </div>
  );
}
