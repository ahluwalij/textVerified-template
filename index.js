const Task = require("./token.js");
const dotenv = require('dotenv');
dotenv.config();

async function run() {
    task = new Task(process.env.APIAccessToken,process.env.serviceID);
    //returns the SMS code
    await task.getCode();
    console.log("now i can do stuff with the code!")
}

run();