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

      <section className="grid grid-cols-3 gap-4 mt-8">
        <Card title="ESTOQUE TOTAL" value="1.284" />
        <Card title="BAIXO ESTOQUE" value="17" danger />
        <Card title="MOVIMENTOS HOJE" value="42" />
      </section>

      <section className="mt-8 border border-zinc-800">
        <table className="w-full text-left">
          <thead className="border-b border-zinc-800 text-zinc-500 text-sm">
            <tr>
              <th className="p-4">Código</th>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Marca</th>
              <th>Qtd</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <Row code="P001" name="Pastilha de Freio" cat="Freios" brand="Bosch" qtd="12" />
            <Row code="P002" name="Filtro de Óleo" cat="Motor" brand="Mann" qtd="4" />
            <Row code="P003" name="Amortecedor Dianteiro" cat="Suspensão" brand="Cofap" qtd="0" />
          </tbody>
        </table>
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

function Row({ code, name, cat, brand, qtd }) {
  const low = Number(qtd) <= 3;

  return (
    <tr className="border-b border-zinc-900 hover:bg-zinc-950">
      <td className="p-4 text-zinc-400">{code}</td>
      <td>{name}</td>
      <td>{cat}</td>
      <td>{brand}</td>
      <td>{qtd}</td>
      <td>
        <span className={low ? "text-rose-500" : "text-emerald-400"}>
          {low ? "CRÍTICO" : "OK"}
        </span>
      </td>
    </tr>
  );
}