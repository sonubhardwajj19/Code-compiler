import { createClient } from "redis";
import fs from "fs";
import { spawn } from "child_process";

const client = createClient();
 client.connect()
   .then(async ()=>{
    while(1){
        const response = await client.rPop("problems");
        if(!response){
            await new Promise ((r) => setTimeout(r,1000));
            continue;
        }

        const parsedResponse = JSON.parse(response);
        const code = parsedResponse.code;
        const language = parsedResponse.language;
            

        if(language === "c++"){
            const filePath = __dirname + "/code/code.cpp";
            fs.writeFileSync(filePath,code);

            const responseCompiler = spawn("g++", [filePath, "-o", "./code/out"]);
            const response = spawn("./code/out");
            response.stdout.on("data",(chunk)=>{
                console.log("Output : ",chunk.toString())
            })

          
            console.log("Now processing your ",parsedResponse.language , "code");
            await new Promise ((r) => setTimeout(r,5000));
        }




        if(language === "js"){
            const filePath = __dirname + "/code/code.js";
            fs.writeFileSync(filePath,code);
          
            const responseCompiler = spawn("node",[filePath]);
            responseCompiler.stdout.on("data",(chunk)=>{
                console.log(" Js Output => ",chunk.toString());
            })

            console.log("Now processing your ",parsedResponse.language , "code");
            await new Promise ((r) => setTimeout(r,2000));
        }



        if(language === "py"){
            const filePath = __dirname + "/code/code.py";
            fs.writeFileSync(filePath,code);
             
            const responseCompiler = spawn("python",[filePath]);
            responseCompiler.stdout.on("data",(chunk)=>{
                console.log("Python output : " , chunk.toString());
            })

            console.log("Now processing your ",parsedResponse.language , "code");
            await new Promise ((r) => setTimeout(r,2000));
        }
    }
   })




