const express = require('express')
const router = require('./routes/external')
const config = require("./utils/config")

const app = express()
let port = config.PUBLIC_PORT

app.use(express.json())
app.use(express.urlencoded({extended: true})
)
app.use((req, res, next) => {       // middleware session logger
    console.log(req.method + " request to " + req.url);
    console.log("Params: " + JSON.stringify(req.params));
    console.log("Body: " + JSON.stringify(req.body))
    console.log("Status " + res.statusCode + " - " + res.statusMessage);
    next();
})
app.use("/", router);



app.listen(port, () => {
    console.log(`Controller listening on port ${port}`)
})