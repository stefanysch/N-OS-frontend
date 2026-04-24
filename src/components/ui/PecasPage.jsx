export default function PecasPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <header className="border-b border-zinc-800 pb-6 flex items-center justify-between">
        <div>
          <p className="text-zinc-500 text-sm">N-OS / Estoque</p>
          <h1 className="text-3xl font-semibold tracking-wide">
            PEÇAS
          </h1>
        </div>

        <button className="border border-zinc-700 px-6 h-11 hover:border-rose-500 transition">
          + NOVA PEÇA
        </button>
      </header>

      <section className="mt-8 flex gap-4">
        <input
          placeholder="Buscar peça..."
          className="flex-1 h-12 bg-zinc-950 border border-zinc-800 px-4 outline-none"
        />

        <button className="w-40 border border-zinc-700 hover:border-rose-500">
          FILTRAR
        </button>
      </section>
    </div>
  );
}

function Card({ title, value, danger }) {
  return (
    <div className="border border-zinc-800 bg-zinc-950 p-6">
      <p className="text-zinc-500 text-sm">{title}</p>
      <h2 className={`text-4xl mt-3 ${danger ? "text-rose-500" : "text-white"}`}>
        {value}
      </h2>
    </div>
  );
}