import express from "express";
import { createClient } from "redis";
import cors from "cors";
import { prisma } from "./db";


const app = express();
app.use(express.json());

app.use(cors());

const client = createClient();
client.connect();


app.post ("/submit",async (req,res) => {
    const language = req.body.language;
    const code = req.body.code;
     
    try {
        const response = await prisma.submissions.create({
             data : {
                code : code,
                language : language ,
                status : "Processing"
            }
        })
        await client.lPush("problems",JSON.stringify({submissionId: response.id, code, language}));
    
        res.json({
            msg : "Your request is being processed" ,
            id : response.id
        })
        console.log(response.id)
    } catch (err) {
        console.log(err);
    }

})


app.get("/submit/:submissionId", async (req,res) => {

    const response = await prisma.submissions.findFirst({
        where: {
            id : req.params.submissionId
        }
    })

    res.json({
        submission : response
    })
})

app.listen(3000);