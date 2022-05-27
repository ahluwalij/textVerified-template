const fetch = require("cross-fetch")

module.exports = class Task {
  constructor(APIAccessToken,serviceID) {
    this.APIAccessToken = APIAccessToken;
    this.serviceID = serviceID;
    this.token = "";
    this.numberDetails = {};
  }

//returns API Access Token  
async getAccessToken() {

  //set headers
  var AccessTokenHeaders = {
    method: 'POST',
    headers: {
      "X-SIMPLE-API-ACCESS-TOKEN": this.APIAccessToken
    },
    redirect: 'follow'
  };

  //initialize request for API Access Token
  const request = fetch("https://www.textverified.com/api/SimpleAuthentication", AccessTokenHeaders)
    .then(response => response.text())
    .catch(error => console.log('error', error));
    
    //set response to token variable
    const token = JSON.parse(await request).bearer_token;

    //print and return result
    console.log(`Token: ${token}\n`)
    return token;
}

//returns a JSON containing all info about a number
async getNumber(){
  //set payload
  var body = JSON.stringify({
    "id": this.serviceID
  });

  //set headers
  var getNumberHeaders = {
    method: 'POST',
    headers: {
      "Authorization": `Bearer ${this.token}`,
      "Content-Type" : "application/json"
    },
    body: body,
    redirect: 'follow'
  };

  //initialize request for numberInfo
  const request = fetch("https://www.textverified.com/api/Verifications", getNumberHeaders)
  .then(response => response.text())
  .catch(error => console.log('error', error));

  //set response to numberInfo variable
  const numberInfo = JSON.parse(await request);

  //print and return results
  console.log(`Number: ${numberInfo.number}`);
  console.log(`Number ID: ${numberInfo.id}\n`);
  return numberInfo;
}

//sets this.code to final SMS code
async monitorForCode() {
  //set numberID
  const numberID = this.numberDetails.id;

  //set Headers
  var smsMonitorHeaders = {
    method: 'GET',
    headers: {
      "Authorization": `Bearer ${this.token}`,
      "Content-Type" : "application/json"
    },
    redirect: 'follow'
  };

  //while loop to check if code is recieved yet
  var gotCode = false;
  while (gotCode == false) {

    //make request
    var request = await fetch(`https://www.textverified.com/api/Verifications/${numberID}`, smsMonitorHeaders)
    .then(response => response.text())
    .catch(error => console.log('error', error));

    //Error handling
    if(request.includes("429")){
      console.log("Error: 429 Error")
      gotCode == true;
      break;
    }

    else if(gotCode == false){
      //make request again if there is no errors
      var numberInfo = JSON.parse(await request);
    }

    //if code is not null, code is recieved and monitoring is stopped
    if(numberInfo.code != null){
      gotCode == true;
      console.log(`Code: ${numberInfo.code}`)
      this.code = numberInfo.code;
    } else{
      //if code is null, keep monitoring
      console.log(`Monitoring, Time Left: ${numberInfo.time_remaining}`);

      //sleep for 1 second
      await this.sleep(1000);
    }
  }


}

//returns SMS code once recieved
async getCode(){
  //returns API Access Token
  this.token = await this.getAccessToken();
  //returns Number JSON from API
  this.numberDetails = await this.getNumber();
  //sets this.code equal to the SMS code
  await this.monitorForCode();
  //return final code
  return this.code;
}

//  -- UTILITY FUNCTIONS --
sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
}