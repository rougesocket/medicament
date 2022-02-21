const mongoose = require("mongoose")
const conn_str = "mongodb://medicament:bR4OfYVJgup8QFGTcAzgUHO3ouV4BaeqVCu6ipk6CESNi8kmwkSOmGZ1uz7LrgaSIwL7kcEfOuALfTX81Ke5yQ==@medicament.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@medicament@";


mongoose.connect(conn_str, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log("Connected successfully..."))
	.catch( (error) => console.log(error) );
