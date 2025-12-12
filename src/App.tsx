import { useState } from "react";
import "./App.css";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

// Auth + create lark customer (+ subscribe to free plan)
// Report usage
// Check billing state on frontend
// paywall + plan upgrades
// lark customer portal for sub cancellations, invoices view

function App() {
  const [count, setCount] = useState(0);
  const tasks = useQuery(api.tasks.get);

  return (
    <>
      <h1>{"Convex + Lark Demo"}</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      {tasks?.map(({ _id, text }) => (
        <div key={_id}>{text}</div>
      ))}
    </>
  );
}

export default App;
