import express from "express";
import { createClient } from "redis";

const app = express();
app.use(express.json());
const client = createClient();
client.connect();


app.post ("/submit",async (req,res) => {
    const language = req.body.language;
    const code = req.body.code;
     
    await client.lPush("problems",JSON.stringify({code,language}));

    res.json({
        msg : "Your request is being processed"
    })
})

app.listen(3000);