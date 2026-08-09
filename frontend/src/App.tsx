
import "./index.css";
import { Button } from "./components/ui/button";
export function App() {
  return (<>
    <div>
      <div className="flex bg-zinc-600 p-3">
        <div className="flex gap-4">
            <Button>C++</Button>
            <Button>Javascript</Button>
            <Button>Python</Button>
            <Button className="ml-30">Submit</Button>
        </div>
      </div>
    
      <div className="flex h-screen w-screen">
        <div className="bg-red-200 flex-1"></div>
        <div className="bg-green-400 flex-1"></div>
      </div>
    </div>
  </> 
  );
}

export default App;
