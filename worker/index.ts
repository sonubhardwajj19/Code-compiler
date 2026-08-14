import { createClient } from "redis";
import fs from "fs";
import { spawn } from "child_process";
import { prisma } from "./db";
import { resolve } from "dns";
 
 const client = createClient();
  client.connect()
    .then( async()=>{
        while(1){
            const response = await client.rPop("problems");
            if (!response){
                await new Promise((r)=>(setTimeout(r,1000)));
                continue;
            }

           const parsedResponse = JSON.parse(response);
           const code = parsedResponse.code; 
           const language = parsedResponse.language;
           const submissionId = parsedResponse.submissionId;
           let finalOutput = "";
           let compilerError = "";
           let exitCodeCompiler = null;
           


           if(language === "c++") {
            const filePath = __dirname + "/code/code.cpp";
            fs.writeFileSync(filePath,code);
            const responseCompiler = spawn("g++",[filePath,"-o","./code/out"]);

            await new Promise<void> (resolve => {
                responseCompiler.stderr.on("data",(chunk)=>{
                      compilerError += chunk.toString();
            })

            responseCompiler.on("close",async(exitCode)=>{
                    exitCodeCompiler = exitCode;
                    if(exitCode !== 0){
                        const str = filePath
                        compilerError = compilerError.replaceAll(str,"");
                          
                        await prisma.submissions.update({
                            where : {
                                id : submissionId
                            } ,
                            data : {
                                status : "Failure" ,
                                output : compilerError
                            }
                        })
                    }
                    resolve()
                })
            })
            
            if(exitCodeCompiler !==0){
                continue;
            }

            const response = spawn("./code/out")
            response.stdout.on("data",(chunk) => {
                 finalOutput += chunk.toString()
            })

            await new Promise<void> (resolve=>{
               response.on("close",async (exitCode)=>{
                    if(exitCode === 0){
                       await prisma.submissions.update({
                        where:{
                            id:submissionId
                        } ,
                        data : {
                            status:"Success" ,
                            output : finalOutput
                        }
                    })
                } else {
                        await prisma.submissions.update({
                         where:{
                             id:submissionId
                         } ,
                         data : {
                             status:"Failure"
                         }
                        })
                    }
                    resolve();
              })
            })
           }





           if(language === "js"){
            const filePath = __dirname + "/code/a.js";
            fs.writeFileSync(filePath,code);
            const responseCompiler = spawn("node",[filePath])    
            
            responseCompiler.stderr.on("data", (chunk)=> {
                compilerError += chunk.toString()
            })

            responseCompiler.stdout.on("data", (chunk)=> {
                finalOutput += chunk.toString()
            })

            console.log(finalOutput)

            console.log(compilerError)

            await new Promise<void> (resolve => {
                responseCompiler.on("close", async (exitCode)=>{
                    if(exitCode !== 0){
                          compilerError = compilerError.replaceAll("///C:/Users/asus/Desktop/KOD/cohort%20%20L/week-24-leetcode/worker/code/a.js:1","");

                          await prisma.submissions.update({
                            where:{
                                id:submissionId
                            } ,
                            data :{
                                status : "Failure" ,
                                output : compilerError
                            }
                          })
                    } else {
                         await prisma.submissions.update({
                            where:{
                                id :submissionId
                            } , 
                            data :{
                                status : "Success" ,
                                output : finalOutput
                            }
                         })
                      
                    }
                    resolve();
                })
            })

           }






           

           if(language === "py"){
            const filePath = __dirname + "/code/p.py";
            fs.writeFileSync(filePath,code);
            const responseCompiler = spawn("python",[filePath])    
            
            responseCompiler.stderr.on("data", (chunk)=> {
                compilerError += chunk.toString()
            })

            responseCompiler.stdout.on("data", (chunk)=> {
                finalOutput += chunk.toString()
            })
            
            await new Promise<void> (resolve => {
                responseCompiler.on("close", async (exitCode)=>{
                    if(exitCode !== 0){
                        compilerError = compilerError.replaceAll(filePath,"");

                          await prisma.submissions.update({
                            where:{
                                id:submissionId
                            } ,
                            data :{
                                status : "Failure" ,
                                output : compilerError
                            }
                          })
                    } else {
                         await prisma.submissions.update({
                            where:{
                                id :submissionId
                            } , 
                            data :{
                                status : "Success" ,
                                output : finalOutput
                            }
                         })
                      
                    }
                    resolve();
                })
            })

           }
        }
    })