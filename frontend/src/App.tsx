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
    const response = await axios.get(`${BACKEND_URL}/submit/${submissionId}`)

    if(response.data.submission.status !== "Processing"){
        setStatus(response.data.submission.status);
        setOutput(response.data.submission.output);
    } else {
      await new Promise(r => setTimeout(r, 3000));
      pollBackend(submissionId)
    }
  }
  return (<>
    <div>
      <div className="flex bg-black p-3">
        <div className="flex gap-4">
            <Button variant={selectedLanguage === "c++" ? "destructive" : "outline"} onClick={() => setSelectedLanguage("c++")}>C++</Button>
            <Button variant={selectedLanguage ==="js" ? "destructive" : "outline"} onClick={()=>{setSelectedLanguage("js")}}>Javascript</Button>
            <Button variant={selectedLanguage ==="py" ? "destructive" : "outline"} onClick={()=>setSelectedLanguage("py")}>Python</Button>
    
            <Button onClick={async()=>{
              setStatus("Processing");
              setOutput("");
                 
              const response = await axios.post(`${BACKEND_URL}/submit`, {
                 "code": textRef.current?.value ,
                 "language":selectedLanguage
              })

              pollBackend(response.data.id);
            }} className="ml-30" >Submit</Button>
        </div>
      </div>
    
      <div className="flex h-screen w-screen">
        <div className="bg-red-100 flex-1">
          <textarea className="w-full h-full p-5 text-lg" ref={textRef}/>
        </div>

        <div className="bg-gray-700 flex-1 p-5 text-lg font-bold overflow-hidden">
          <span  className= "flex text-gray-300">
             Status <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 20 24" stroke-width="1.5" stroke="currentColor" className="size-8 mr-5 ml-3">
                       <path stroke-linecap="round"  d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H5" />
                    </svg>
                    <span className={status=== "Failure" ? "text-red-300" : "text-green-500"}>
                       {status}
                    </span>
          </span>
          <div className="w-full h-full p-6">
            <span className="text-gray-300">
               Final Output :
            </span>
            <div  className={`p-2 border h-full w-full${status === "Failure" ? "text-red-300" : "text-yellow-400"}`}>
                  {output}
            </div>
          </div>
        </div>
      </div>
    </div>
  </> 
  )
}

export default App;
