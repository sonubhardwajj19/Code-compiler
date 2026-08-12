import "./index.css";
import { Button } from "./components/ui/button";
import { useRef, useState } from "react";
import axios from "axios";


const BACKEND_URL = "http://localhost:3000";

export function App() {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [status,setStatus] = useState("");
  const [output,setOutput] = useState("");
  const [selectedLanguage,setSelectedLanguage] = useState("");
  async function pollBackend(submissionId:string){
    const response = await axios.get(`${BACKEND_URL}/submit/:${submissionId}`);
    console.log(response)
  }
  return (<>
    <div>
      <div className="flex bg-zinc-600 p-3">
        <div className="flex gap-4">
            <Button variant={selectedLanguage === "cpp" ? "destructive" : "outline"} onClick={() => setSelectedLanguage("cpp")}>C++</Button>
            <Button variant={selectedLanguage ==="js" ? "destructive" : "outline"} onClick={()=>{setSelectedLanguage("js")}}>Javascript</Button>
            <Button variant={selectedLanguage ==="py" ? "destructive" : "outline"} onClick={()=>setSelectedLanguage("py")}>Python</Button>
            <Button onClick={async()=>{
              setStatus("Processing");
              setOutput("");
                 
              const response = await axios.post(`${BACKEND_URL}/submit`, {
                 "code": textRef.current?.value ,
                 "language":selectedLanguage
              })

              console.log(response.data.id);

            pollBackend(response.data.id);          
           

            }} className="ml-30" >Submit</Button>
        </div>
      </div>
    
      <div className="flex h-screen w-screen">
        <div className="bg-red-100 flex-1">
          <textarea className="w-full h-full p-5 text-lg" ref={textRef}/>
        </div>
        <div className="bg-green-300 flex-1">
          {output}
        </div>
      </div>
    </div>
  </> 
  );
}

export default App;
