import express from 'express'
import dotevn from 'dotenv';
dotevn.config();

const PORT = process.env.PORT || 8001;
const app = express();


app.get('/',(req,res)=>{
    res.send("Hello");
});

app.listen(PORT,()=>{
    console.log(`Listening to port : ${PORT}`);
})