import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black gap-4">
      <h1 className="text-white text-3xl">
        N-OS rodando 🚀
      </h1>

      <p className="text-gray-400">
        Tailwind funcionando
      </p>

      <button
        className="bg-blue-500 px-4 py-2 rounded text-white"
        onClick={() => setCount(count + 1)}
      >
        Clique: {count}
      </button>
    </div>
  );
}