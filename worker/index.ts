import { createClient } from "redis";
import fs from "fs";
import { spawn } from "child_process";
import { exitCode } from "process";
import { resolve } from "dns";
import { prisma } from "./db";

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
        const submissionId = parsedResponse.submissionId;
        let finalOutput = "";


        if(language === "c++"){
            const filePath = __dirname + "/code/code.cpp";
            fs.writeFileSync(filePath,code);

            const responseCompiler = spawn("g++", [filePath, "-o", "./code/out"]);
            console.log("chck 1")
            let exitCodeCompiler = null;
            console.log("chck 2")
            await new Promise<void> (resolve => {
                console.log("chck 3")
                responseCompiler.on("exit",async (exitCode)=>{
                    exitCodeCompiler = exitCode;
                    console.log("chck 4")
                    console.log(submissionId)
                    if(exitCode !== 0 ){
                        await  prisma.submissions.update({
                            where : {
                                id: submissionId
                            } ,
                            data: {
                                status : "Failure"
                            }
                        })
                    }
                    console.log("chck 5")
                    resolve();
                })
            })
            console.log("chck 6")
            
            if(exitCodeCompiler !== 0){
                continue;
            }
            console.log("chck 7")
            
        
                const response = spawn("./code/out");
                response.stdout.on("data",(chunk)=>{
                    finalOutput += chunk.toString();
                })
           

           console.log(response);
           console.log("hello before")
           console.log(response)
           console.log("hello after")
            await new Promise<void> (resolve => {
                response.on("exit",async (exitCode) => {
                    exitCodeCompiler = exitCode;
                    if(exitCode === 0 ){
                       await prisma.submissions.update({
                        where : {
                            id : submissionId
                        } ,
                        data :{
                            output : finalOutput ,
                            status : "Success"
                        }
                       })
                    } else {
                      await prisma.submissions.update({
                      where : {
                        id : submissionId
                    } ,
                    data :{
                        status : "Failure"
                    }
                    })
                }
                resolve();
                })
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




