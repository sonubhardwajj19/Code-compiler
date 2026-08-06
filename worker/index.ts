import { createClient } from "redis";

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
            console.log("Now processing your ",parsedResponse.language , "code");
            await new Promise ((r) => setTimeout(r,10000));
        }
        if(language === "js"){
            console.log("Now processing your ",parsedResponse.language , "code");
            await new Promise ((r) => setTimeout(r,10000));
        }
        if(language === "py"){
            console.log("Now processing your ",parsedResponse.language , "code");
            await new Promise ((r) => setTimeout(r,10000));
        }
    }
   })