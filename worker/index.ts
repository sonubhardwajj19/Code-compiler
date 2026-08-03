import { createClient } from "redis";
import fs from "fs";
import { spawn } from "child_process";
import { prisma } from "./db.ts";
import { resolve } from "dns";
import { exitCode } from "process";


const client = createClient();
client.connect()
    .then( async ()=> {
           while(1){
            const response = await client.rPop("problems");
            if(!response){
                await new Promise((r)=> setTimeout(r, 1000));
                continue;
            }
            
            const parsedResponse = JSON.parse(response);
            const code = parsedResponse.code;
            const language = parsedResponse.language;
            const submissionId = parsedResponse.submissionId;
            console.log("Running ",parsedResponse.code," for user ",parsedResponse.userId);

            let finalOutput = " ";
            if(language === "cpp"){
                const filePath = __dirname + "/code/a.cpp";
                console.log("Processing your c++ code ");
                fs.writeFileSync(filePath,code);
                const responseCompiler = spawn("g++",[filePath,"-o","./code/out"]);
                let exitCodeCompiler = null;
                await new Promise<void> (resolve => {
                    responseCompiler.on("exit", async (exitCode)=>{
                        exitCodeCompiler = exitCode;
                        if(exitCode !== 0){
                            await prisma.submission.update({
                                where:{
                                    id : submissionId
                                },
                                data:{
                                    status:"Failure"
                                }
                            })
                        }  
                        resolve();
                    })
                })
                
                if(exitCodeCompiler !== 0){
                    continue;
                }

                const response = spawn("./code/out");
                response.stdout.on("data",(chunk)=>{
                    console.log(chunk.toString());
                    finalOutput += chunk.toString();
                })
                //important part => to keep js thread busy untill the whole process gets completed 
                await new Promise<void> (resolve => {
                    response.on("exit",async (exitcode) => {
                        if(exitcode === 0){
                            await prisma.submission.update({
                            where : {
                                id: submissionId
                            },
                            data: {
                                status:"Succes",
                                output:finalOutput
                            }
                        })
                        }else{
                            await prisma.submission.update({
                            where : {
                                id: submissionId
                            },
                            data: {
                                status:"Failure",
                            }
                        })
                        }
                        
                    })
                    resolve();
                })

                    
            }

            if(language === "js"){
                const filePath = __dirname + "/code/a.js";
                console.log("Processing your JS code ");
                fs.writeFileSync(filePath,code);
                const response = spawn("node",[filePath]);
                response.stdout.on("data",(chunk)=>{
                    console.log(chunk.toString());
                })
                await new Promise((r)=> setTimeout(r, 1000));
                   await new Promise<void> (resolve => {
                    response.on("exit",async () =>{
                        await prisma.submission.update({
                            where : {
                                id: submissionId
                            },
                            data: {
                                status:"Succes",
                                output:finalOutput
                            }
                        })
                    })
                    resolve();
                })
            }
           }
    })


