import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="w-full px-4 py-12">
      <div className="mx-auto flex w-full max-w-[640px] flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          This seller does not have a public dealer page.
        </p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:bg-foreground/90"
        >
          Go to homepage
        </button>
      </div>
    </div>
  );
}
