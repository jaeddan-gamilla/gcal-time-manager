export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 text-center text-slate-500 text-sm pb-6">
      <hr className="border-slate-200 mb-4" />
      <p>
        © {year} <span className="font-medium text-slate-700">Jaeddan Gamilla</span>. 
        Built using React, TailwindCSS, and Google Calendar.
      </p>
      <p className="mt-1">
        Designed for simplicity, clarity, and productivity.
      </p>
    </footer>
  );
}
