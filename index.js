const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const port = process.env.PORT || 8000;

const app = express();


// middleware : 
app.use(cors());
app.use(express.json());



// verify jwt token : 


function verifyJWT(req,res,next){
    const authorization = req.headers.authorization;
    if(!authorization){
        return res.status(401).send({message:'unauthiorize access'})
    };

    const token = authorization.split(' ')[1];
    jwt.verify(token,process.env.SECURE_ACCESS_TOKEN,(err,decoded)=>{
        if(err){
            return res.status(403).send({message:'forbiden'})
        }
        req.decoded = decoded;

    next();
    })

}

// connect to mondodb database



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASSWORD}@cluster0.mzvh4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const run = async () => {
    try{
        client.connect();
        const serviceCollection = client.db("geniusCar").collection("service");
        const orderCollection = client.db("geniusCar").collection("order");



        // AUTH : 

        app.post('/login',async(req,res)=>{
            const user = req.body;
            const token = jwt.sign(user,process.env.SECURE_ACCESS_TOKEN,{
                expiresIn:'1d'
            });

            res.send(token);
        })
        
        // get service : 

        app.get('/service',async(req,res)=>{
            const query = {};
            const cursor = serviceCollection.find(query);
            const service = await cursor.toArray();
            res.send(service);
        })

        // get specifi service 

        app.get('/service/:id',async(req,res) => {
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const service = await serviceCollection.findOne(query);
            res.send(service)
        })


        // insert data to database : 

        app.post('/service',async(req,res)=>{
            const data = req.body;
            const result = await serviceCollection.insertOne(data);
            res.send(result);
        })

        // delete data from database : 

        app.delete('/service/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const result = await serviceCollection.deleteOne(query);
            res.send(result);
        });


        // order collection post : 

        app.get('/orders',verifyJWT,async(req,res)=>{
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if(email === decodedEmail){
                const query = {email:email};
                const cursor = orderCollection.find(query);
                const orders = await cursor.toArray();
                res.send(orders);
            }
            
        });
    
        app.post('/order',async(req,res)=>{
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })

    } finally {

    }
}

run().catch(console.dir)


//   const collection = 



app.get('/',(req,res) => {
    res.send('geneuis car service is running')
})


app.listen(port,()=>{
    console.log('server is running port',port);
})