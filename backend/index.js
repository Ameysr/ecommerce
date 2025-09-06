const express = require('express');
const cors = require('cors');
require('dotenv').config();
const main =  require('./config/db');
const cookieParser =  require('cookie-parser');
const app = express();
const redisClient = require('./config/redis');
const authRouter = require('./routes/authRoute')
const cartRouter = require('./routes/cartRoutes');
const itemRouter = require('./routes/itemRoutes');


app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true 
}))

app.use(express.json()); // the data come form req.body is in the form of jaso so we have to convert it in the form of the javascript object 
app.use(cookieParser()); // same like express.jason we have to also contert it in the jason to js obj 

app.use('/user',authRouter);
app.use('/post',cartRouter);
app.use('/users', itemRouter);



const InitalizeConnection = async ()=>{
    try{

        await Promise.all([main(),redisClient.connect()]);
        console.log("DB Connected");
        
        app.listen(process.env.PORT, ()=>{
            console.log("Server listening at port number: "+ process.env.PORT);
        })

    }
    catch(err){
        console.log("Error: "+err);
    }
}


InitalizeConnection();

