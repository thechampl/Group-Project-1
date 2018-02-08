// Firebase setup


// Initialize Firebase
var config = {
  apiKey: "AIzaSyCMbj3WWdbHZ5Of9DkgN1sBMwoOh0jrmd8",
  authDomain: "slack-trivia-a81b8.firebaseapp.com",
  databaseURL: "https://slack-trivia-a81b8.firebaseio.com",
  projectId: "slack-trivia-a81b8",
  storageBucket: "slack-trivia-a81b8.appspot.com",
  messagingSenderId: "665823338618"
};
firebase.initializeApp(config);

var database = firebase.database();

//On page load, get all users from Trivia channel and create players in firebase. Each player will have, playing: boolean, wins, losses, answer, prof pic


var slackChannel = "C94B6F9GA";
var slackURL = "https://slack.com/api/conversations.members?token=" + api.slackToken + "&channel=" + slackChannel;

var userIDs = [];

$.ajax({
  url: slackURL,
  method: "GET"
}).done(function (response) {

  var members = response.members;
  
  members.forEach(function(member){
    userIDs.push(member);
  })
  
  userIDs.forEach(function(userID){

    var slackUserURL = "https://slack.com/api/users.info?token=" + api.slackToken + "&user=" + userID;

    $.ajax({
      url: slackUserURL,
      method: "GET"
    }).done(function(response){
      console.log(response);
      console.log(response.user.real_name);

      database.ref("/players/").push({
        name: response.user.real_name,
        image: response.user.profile.image_512,
        userdID: userID,
        answer: "",
        score: 0
      })

      database.ref("/players/").onDisconnect().remove();
    
    })

  })



}).fail((xhr) => {
  if (xhr.status === 429) {
    $('#random').html(`<p>Rate limited. Try again in a minute.</p>`);
  }
  else {
    console.log(xhr);
  }
});


//Limit to one sesssion by disabling Start button if one session already exisits

//Listener for "Start" messages from users that will change their playing to TRUE

//Click event for Start button:
//Get #numberQuestions, #category

//Set difficulty: 
// if (questionnumber <= numberQuesions/3) {
//   difficulty === "Easy";
// } else if (questionnumber > numberQuesions/3 && questionnumber <= (numberQuesions/3)*2) {
//   difficulty === "Medium";
// } else if (questionnumber > (numberQuesions/3)*2 && questionnumber <= numberQuesions) {
//   difficulty === "Hard";
// }

//Show first question, start timer


//Listener for user answer messages. Validate if = 1, 2, 3, or 4 store in Firebase or give error message

//At timeout, display correct answer and users who got it right

//At timeout, display leaderboard

//At timeout, go to next question

//On last question show leader board, say game over, highlight top 3



//QUESTIONS:
//Use webhook to post question in message to Channel
//Get the last message to the channel thread_ts: https://slack.com/api/channels.history?token=SLACKTOKEN&channel=C94B6F9GA&count=1
//Take the thread_ts of the message to get the replies after the timeout: https://slack.com/api/channels.history?token=SLACKTOKEN&channel=C94B6F9GA&thred_ts=THREAD_ID
//For each message take the User and look up the userID in Firebase and store their answer

var slackPostURL = "https://hooks.slack.com/services/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";
var message = "Hello World";

$.ajax({
  data: 'payload=' + JSON.stringify({
      "text": message
  }),
  dataType: 'application/json',
  processData: false,
  type: 'POST',
  url: slackPostURL
}).done(function(response){
  console.log(response);
});
=======
var x = 0;

$("#startGame").on("click", function () {
  var numberQuestions = $("#numberQuestions").val();
  var category = $("#category").val();
  var difficulty = $("#difficulty").val().toLowerCase();
  var answerArray = [];



  $.ajax({
    url: "https://opentdb.com/api.php?amount=" + numberQuestions + "&category=" + category + "&difficulty=" + difficulty + "&type=multiple",
    method: "GET"
  })

    .done(function (response) {



      //trivia function, pushing answers into an array then sorting them
      var trivia = function () {
        $("#triviaSetup").empty();
        $("#triviaSetup").html((response.results[x].question))
var correctAnswer= response.results[x].correct_answer;
        answerArray.push(response.results[x].correct_answer);
        answerArray.push(response.results[x].incorrect_answers[0]);
        answerArray.push(response.results[x].incorrect_answers[1]);
        answerArray.push(response.results[x].incorrect_answers[2]);
        answerArray.sort()
      var correctNumber = (answerArray.indexOf(correctAnswer) + 1)

        // creates buttons with id of its index value
        for (i = 0; i < answerArray.length; i++) {

          var answerButton = $("<button class='btn btn-primary btn-lg btn-block'>");
          answerButton.append(answerArray[i]);
          $("#triviaSetup").append(answerButton);

          
          
            
        
    
        }

      }
      trivia();
    


      // timer function
      var counter = 10;

      var countdown = setInterval(function () {
        counter--;
        if (counter < 0) {
          answerArray = [];
          counter = 10;
          x = x + 1;
          trivia();

        }
        else {
          $("#timerDiv").text("Time Left: " + counter.toString() + " seconds");

        }
      }, 1000);

     
    
   

});





});





