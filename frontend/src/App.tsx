import "./index.css";
import { Button } from "./components/ui/button";
import { Footer } from "./components/ui/footer";
import { useRef, useState } from "react";
import Editor from '@monaco-editor/react';
import axios from "axios";



const BACKEND_URL = "http://localhost:3000";

export function App() {
  // const textRef = useRef<HTMLTextAreaElement>(null);
  const [code, setCode] = useState("");
  const [status,setStatus] = useState("");
  const [output,setOutput] = useState("");
  const [input,setInput] = useState("");
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
    <div className="overflow-x-hidden">
      <div className="flex bg-gray-950 p-3 justify-between ">
          <div className="flex gap-4">
              <Button variant={selectedLanguage === "cpp" ? "destructive" : "outline"} onClick={() => setSelectedLanguage("cpp")}>C++</Button>
              <Button variant={selectedLanguage ==="javascript" ? "destructive" : "outline"} onClick={()=>{setSelectedLanguage("javascript")}}>Javascript</Button>
              <Button variant={selectedLanguage ==="python" ? "destructive" : "outline"} onClick={()=>setSelectedLanguage("python")}>Python</Button>
            
              <Button onClick={async()=>{
                  setStatus("Processing");
                  setOutput("");
                    
                  const response = await axios.post(`${BACKEND_URL}/submit`, {
                    "code": code ,
                    "input": input,
                    "language":selectedLanguage 
                  })
    
                  pollBackend(response.data.id);
                
              }} className="ml-30" >Submit</Button>
          </div>

          <span className="inline-flex items-center gap-1 select-none mr-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-xl font-black text-white">
                U
              </span>

              <span className="text-[23px] font-bold tracking-[-0.8px] text-white">
                Compile
              </span>
        </span>
      </div>
    

    
      <div className="flex h-screen w-screen gap-1 bg-black">
        {/* left input area */}
      
          <div className="flex-1">
            <Editor  className="border border-gray-500"  
                theme="vs-dark" language={selectedLanguage}  
                onChange={(chunk:any)=>{
                  setCode(chunk)

                }}>
            </Editor>
          </div>


          {/* right part  */}
          <div className="bg-gray-800 flex-1 p-5  overflow-hidden border border-gray-500">

            <span  className= "flex text-normal text-gray-200 pl-1">
              Status :
                  <span className={status=== "Failure" ? "text-red-300" : "text-green-500"}>
                    {status}
                  </span>
            </span>

             
             <div className="mb-4 mt-2">
                <span className="font-normal text-gray-200 text-base p-1"> If your code takes input, add it in the box below before running.</span>
                  <div className="border-2 border-gray-500 p-0 w-full h-35 font-normal text-white bg-gray-900 ">
                      <textarea  className="w-full h-full p-3" 
                          onChange={(e:any)=>{
                            setInput(e.target.value)}}>
                      </textarea>
                  </div>
             </div>

            <div className="w-full h-full">
                <span className="text-gray-200 text-base font-normal">
                  Final Output :
                </span>
                <div  className={`whitespace-pre-wrap p-2 border w-full border-2 bg-gray-900 border-gray-500 h-screen  mb-5 ${status === "Failure" ? "text-red-300" : "text-yellow-500"}`}>
                      {output}
                </div>
            </div>
          </div>
      </div>
       <Footer/>
    </div>
  </> 
  )
}

export default App;
