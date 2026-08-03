import express from "express";
import {createClient} from "redis";
import { prisma } from "./db";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const client = createClient({
  socket: {
    host: "localhost",
    port: 6379
  }
});
client.connect();

app.post("/submission", async (req,res)=> {
    const language = req.body.language;
    const code = req.body.code;

    const response = await prisma.submission.create({
      data:{
        language ,
        code,
        status: "Processing"
      }
    })
    client.lPush("problems",JSON.stringify({submissionId:response.id, language,code}))

    res.json({
        msg: "Problem in processing",
        Id : response.id
    })

})

app.get("/submission/:submissionId", async (req,res)=> {

    const response = await prisma.submission.findFirst({
      where: {
        id:req.params.submissionId
      }
    })


    res.json({
      submission: response
    })

})

app.listen(3000);