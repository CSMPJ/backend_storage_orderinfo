const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const { response } = require("express");
const moment = require("moment");
const app = express();
const host = 'localhost'
const port = 3001

app.use(express.json());
app.use(cors());

const product_system = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "chansithjob",
    database: "product_system",
    port: "3306"
});


product_system.connect(function(err) {
  if (err) {
    return console.error('error: ' + err.message);
  }
  console.log('Connected to the MySQL server.');
});


app.get('/products',(req, res)=>{
    
  const products = req.body.products;
  product_system.query(
    `SELECT * FROM product_system.product`,
      (err, result) =>{
          if (err) {
            res.send({ err: err });
          } 
          else {
            res.send(result);
          }
        }  
  );
});


app.post('/products',async (req, res)=>{
  const date_order = moment().format("YYYY-MM-DD HH:mm:ss");
  const products = req.body;
  async function lastOrderId (){
    const conn = require('mysql2/promise')
    const connect = await conn.createConnection({
      user: "root",
      host: "localhost",
      password: "chansithjob",
      database: "product_system",
      port: "3306"
    })
    const [rows,fields] = await connect.execute(`SELECT * FROM product_system.order_information ORDER BY order_id DESC LIMIT 1`)
    return rows[0].order_id
  }
  async function manage (p){
    
      let list = "";
   
    for(var i = 0; i<p.length; i++){
      list = list+`('${p[i].product_name}','${p[i].product_price}','${p[i].product_quantity}','${date_order}','waiting to pay','${p[i].client_address}','${Number(await lastOrderId())+1}')${i==p.length-1 ? "" :","}\n`
      
      if(i==p.length-1){
          return `INSERT INTO product_system.order_information (product_name, product_price, product_quantity, date_order, status_order, client_address, order_id) 
             VALUES${list}`
      }
  }
  }
 
  product_system.query(await manage(products.data),
      (err, result) =>{
          if (err) {
              res.send({ err: err });
        } 
                  res.send(result); 
      }
    );
});


app.post('/products/information', async (req, res)=>{
  const products = req.body;
 
  function manage (p){
      let list = "";
      let list_ID = "";
      for(var i = 0; i<p.length; i++){
          list = list+`WHEN ${p[i].product_id} THEN product_quantity - ${p[i].quantity_buy} \n`
          list_ID = list_ID+( i == p.length-1  ? `${p[i].product_id}` : `${p[i].product_id},`)
          if(i==p.length-1){
              return `update product_system.product set product_quantity = CASE product_id \n ${list} END where product_id IN (${list_ID})`
          }
      }
  }
  
  product_system.query(
      await manage(products.data),
      async(err, result) =>{
          if (err) {
              res.send({ err: err });
        } 
                  res.send(result); 
      }
    );
            
  
});



app.get('/products/information',(req, res)=>{
  const products = req.body;

  product_system.query(
    `SELECT * FROM product_system.order_information`,
      (err, result) =>{
        if (err) {
          res.send({ err: err });
        } 
        else {
          res.send(result);
          } 
        }
      
  );
});


app.listen(port, ()=>{
    console.log(`Sever is now listening at port ${port}`)
})
