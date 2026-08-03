import "./index.css";
import { Button} from "./components/ui/button";
import { Textarea } from "./components/ui/textarea";
import axios from "axios";
import { useRef, useState } from "react";

const BACKEND_URL = "http://localhost:3000";

export function App() {
  const textAreaRef = useRef<HTMLTextAreaElement> (null);
  const [status , setStatus] = useState(" ");
  const [output, setOutput] = useState(" ");
  
  async function pollBackend (submissionId:string){
    const response = await axios.get(`$BACKEND_URL/submission/${submissionId}`);
    if(response.data.submission.status !== "Processing"){
        setStatus(response.data.submission.status);
        setOutput(response.data.submission.output);
    }else{
      await new Promise (r=>setTimeout(r,2000));
      pollBackend(submissionId);
  
    }
  }

  return (<>
  <div className="h-screen w-screen flex m-5">
    <div className="flex-1">
      <div className="flex justify-between m-1">
        <div className=" flex gap-5">
          <Button>C++</Button>
          <Button>Js</Button>
          <Button>Python</Button>
        </div>
        <div>
          <Button onClick={async() => {
            setStatus("Processing");
            setOutput(" ");
            const response  = await axios.post(`$BACKEND_URL/submission`,{
              "code": textAreaRef.current!.value,
              "language": "cpp"
            })

            pollBackend(response.data.id);
          }}>Submit</Button>
        </div>
      </div>
      <Textarea ref={textAreaRef} className="h-screen w-full"></Textarea>
    </div>
    <div className="flex-1 bg-green-300 m-8 rounded-xl">
        {status}
        {output}
    </div>
  </div>
   </>
  );
}
export default App;
