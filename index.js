const app = require("./app")
const port = process.env.PORT || 3000;

app.listen(port,()=>{
    console.log(`started express server at port ${port}`);
})