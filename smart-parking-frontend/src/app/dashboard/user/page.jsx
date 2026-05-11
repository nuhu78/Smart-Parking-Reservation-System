export default function UserDashboardPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-4 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
          User Dashboard
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          This is user page
        </h1>
      </div>
    </div>
  );
}