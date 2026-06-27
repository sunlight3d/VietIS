
var admin = require('firebase-admin')
var serviceAccount = require("./serviceAccount.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://finalmatch-9f4fe.firebaseio.com"
});

const sendFirebaseCloudMessage = async ({ title, data, notificationTokens }) => {
  const failedTokens = [];
  try {            
    if (notificationTokens.length == 0) {
      console.log('No notification Tokens to send');
      return []
    }    
    let response = await admin.messaging().sendMulticast({
      data,
      tokens: notificationTokens,
    })    
    if (response.failureCount > 0) {
      if (response.successCount == notificationTokens.length) {
        console.log("send all notifications successfully")
      }
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(notificationTokens[idx]);
        }
      })
      console.log('List of tokens that caused failures: ');
      failedTokens.forEach(failedToken => {
        console.log(`{failedToken}\n`)
      })

    }    
    return failedTokens
  } catch (error) {    
    console.log('Cannot send FCM.Error =' + error);
    return failedTokens
  }
}

module.exports = {
    sendFirebaseCloudMessage
}
//Test this function
setInterval(async () => {
  console.log('Bat dau gui')
  await sendFirebaseCloudMessage({
    title: "haha", 
    data: {name: "Hoang", age: "20"},
    notificationTokens: [      
      "eQuozvf3SP2aIXZDKPWQJL:APA91bHT8fZMhlkfQfmPl5TvRmtMmRm3hzIU0-naBmJXfFzyVFOSBI5OtygbeY4CoaoiZFCIyOKmpUpEaetz2nErayrBXh48cTwOmmcwKSwThQ50NQRdAxKcnw-1-5_0UU9Rgq-Ihva2",
      "cqmc8tc7QIeU_SxKdY6sCU:APA91bEzIzsEMDs074tQTc1i4s9mi8pqGxL-AvprbADRhAhrV5y-mquMc5fJyeZ9rsS_WAfCrbyA4RKWJp3VlisvchtHEfHauLXl-GvwkceWhFuuBScVRq1roOnJXiz_9kTigXQ1NAlO"
    ]
  })
  console.log('Da gui xong')
}, 5000)