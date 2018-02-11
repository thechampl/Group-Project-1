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

//Only start game if one isn't in progress
var gameStarted = false;

database.ref().on("value", function(snapshot){
  if (snapshot.child("players").exists()) {

   gameStarted = true;
    
  } else {

    gameStarted = false;
  }

})


  $("#startGame").on("click", function () {
    
    if (gameStarted) {
      
      $('#myModal').modal('show');

    } else {

      //On page load, get all users from Trivia channel and create players in firebase. Each player will have, playing: boolean, wins, losses, answer, prof pic
    
    
        var slackChannel = "C94B6F9GA";
        var slackURL = "https://slack.com/api/conversations.members?token=" + api.slackToken + "&channel=" + slackChannel;
    
        var userIDs = [];
    
        //Get members of Slack Trivia Channel
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
    
            //Send Slack User information to Firebase
            $.ajax({
              url: slackUserURL,
              method: "GET"
            }).done(function(response){
    
              database.ref("/players/" + userID).set({
                name: response.user.real_name,
                image: response.user.profile.image_512,
                userdID: userID,
                answer: "",
                score: 0
              })
    
              
    
              //Removes players at the end of each game
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
    
    
      var intervalId
      var counter = 15;
    
      //Get #numberQuestions, #category, and #difficulty
      var numberQuestions = $("#numberQuestions").val();
      var category = $("#category").val();
      var difficulty = $("#difficulty").val().toLowerCase();
      var questionX = 0;
      var answerArray = [];
      var slackQuestion = "";
      var correctAnswer = "";
      var correctNumber

      
    
    
    
      $.ajax({
        url: "https://opentdb.com/api.php?amount=" + numberQuestions + "&category=" + category + "&difficulty=" + difficulty + "&type=multiple",
        method: "GET"
      })
    
        .done(function (response) {
    
          var trivia = function () {
    
            if (questionX < numberQuestions) {
            
              $("#triviaSetup").empty();
              $("#triviaSetup").html((response.results[questionX].question));
    
              //Send message to Slack channel with Trivia Question
              var question = $("#triviaSetup").html();
              var slackPostURL = "https://hooks.slack.com/services/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";
              var message = "Question " + (questionX + 1) + ": " + question;
              
              $.ajax({
                data: 'payload=' + JSON.stringify({
                    "text": message
                }),
                dataType: 'application/json',
                processData: false,
                type: 'POST',
                url: slackPostURL
              }).fail((xhr) => {
                  console.log(xhr);
              });
                
    
              //Quick delay to then pull the thread ID of the last message in the channel which would be the Question
              //Store the thread ID in slackQuestion to use later to get thread replies
              setTimeout(function(){
                var slackGetThreadURL = "https://slack.com/api/channels.history?token=" + api.slackToken + "&channel=C94B6F9GA&count=1";
    
                $.ajax({
                  url: slackGetThreadURL,
                  method: "GET"
                }).done(function(response){
                  console.log(response);
    
                  slackQuestion = response.messages[0].ts;
    
        
                }).fail((xhr) => {
                  if (xhr.status === 429) {
                    $('#random').html(`<p>Rate limited. Try again in a minute.</p>`);
                  }
                  else {
                    console.log(xhr);
                  }
                });
              },100);
    
              console.log(slackQuestion);
                
    
    
        
              //Get Correct Answer for each question
              correctAnswer= response.results[questionX].correct_answer;
    
              //Pushing answers into an array then sorting them
              answerArray.push(response.results[questionX].correct_answer);
              answerArray.push(response.results[questionX].incorrect_answers[0]);
              answerArray.push(response.results[questionX].incorrect_answers[1]);
              answerArray.push(response.results[questionX].incorrect_answers[2]);
              answerArray.sort()
    
              //Get the number of the correct answer
              correctNumber = parseInt(answerArray.indexOf(correctAnswer) + 1);
    
              // creates buttons with id of its index value (this is not being used now)
              for (i = 0; i < answerArray.length; i++) {
    
                var answerButton = $("<button class='btn btn-primary btn-lg btn-block'>");
                answerButton.append(answerArray[i]);
                $("#triviaSetup").append(answerButton);
          
              
          
              }
    
              run();
            } else {
              endOfGame();
            }
    
          }
    
          
          trivia();
          
          
          
    
          //Timer functions
          function run() {
            counter = 15;
            intervalId = setInterval(decrement, 1000);
          }
    
          function stop() {
            clearInterval(intervalId);
          }
    
          function decrement() {
            counter--;
    
            if (counter < 0) {
    
              stop();
    
              answerArray = [];
              
              questionX = questionX + 1;
    
              // When timer runs out, get the replies to the thread
              var slackAnswerURL = "https://slack.com/api/channels.replies?token=" + api.slackToken + "&channel=C94B6F9GA&thread_ts=" + slackQuestion;
    
              $.ajax({
                url: slackAnswerURL,
                method: "GET"
              }).done(function(response){
                console.log(response);
                var points = response.messages.length - 1;
    
                //Get the text from each reply and look up the user in Firebase and set their answer to the text
                for (i = 1; i < response.messages.length; i++ ){
                  var answerUserID = response.messages[i].user;
                  var answerUserAnswer = parseInt(response.messages[i].text);
                  var score

                  
                  console.log(points);
    
                  console.log(answerUserID + " answered " + answerUserAnswer + ". The correct answer was " + correctNumber);
    
                  database.ref("/players/" + answerUserID + "/answer").set(answerUserAnswer);
    
                  database.ref("/players/" + answerUserID + "/").on("value", function(snapshot){
                    score = snapshot.val().score;
                    console.log(score);
                    console.log(snapshot.val());
    
                  })
    
                  if(answerUserAnswer === correctNumber) {
                    console.log(answerUserID + " was correct!")
                    score += points;
    
                    database.ref("/players/" + answerUserID + "/score").transaction(function(score) {
                      return score + points;
                    })
                  }
    
                  points = points - 1;
                  
                }
    
    
                //Compare the answer to the correct answer, add point if equal
    
    
              })
    
             
            //Display Correct Answer
    
            $("#triviSetup").empty();
            $("#triviaSetup").html(correctAnswer);
    
            setTimeout(function(){
    
              //Display Top Players
              $("#triviaSetup").empty();
              $("#triviaSetup").html("<h1>The Top Players Are</h1>");
    
              leaders();
    
              //Restart Game
              setTimeout(trivia, 5000);
    
              counter = 15;
    
            }, 5000);
    
        
    
            }
            else {
              $("#timerDiv").text("Time Left: " + counter.toString() + " seconds");
    
            }
          };
    
          
          function leaders() {
    
            $("#triviaSetup").append($("<div>").attr("class", "row")).append($("<div>").attr("class", "md-col-6").attr("id", "top-10")).append($("<div>").attr("class", "md-col-6").attr("id", "top-20"))
            $("#top-10").append($("<ol>").attr("id", "top-10-players"));
            $("#top-20").append($("<ol>").attr("id", "top-20-players").attr("start", "11"));
           var players = [];
    
           database.ref("/players/").once("value").then(function(snapshot){
            var remoteData = snapshot.val();
            
            snapshot.forEach(function(player) {
              var playerInfo = player.val();
    
              players.push(playerInfo);
            })
    
            
            console.log("Unsorted", players);
     
            players.sort(function(a,b) {
              return b.score - a.score;
            })
    
            
            for ( i = 0; i < 10; i ++) {
              $("#top-10-players").append($("<li>").text(players[i].name + " - " + players[i].score));
            }
    
            for ( i = 10; i < 20; i ++) {
              $("#top-20-players").append($("<li>").text(players[i].name + " - " + players[i].score));
            }
    
           })
           
    
           
          
           
          }
    
          //On last question show leader board, say game over, highlight top 3
    
          function endOfGame() {
            $("#triviaSetup").html("<h1>Game Over!</h1>");
    
            var slackPostURL = "https://hooks.slack.com/services/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";
            var message = "Game Over!";
            
            $.ajax({
              data: 'payload=' + JSON.stringify({
                  "text": message
              }),
              dataType: 'application/json',
              processData: false,
              type: 'POST',
              url: slackPostURL
            }).fail((xhr) => {
                console.log(xhr);
            });
    
            leaders();
          }
    
        
    
      });
      
    }
    });











//Limit to one sesssion by disabling Start button if one session already exisits

//Listener for "Start" messages from users that will change their playing to TRUE

//Set difficulty: 
// if (questionnumber <= numberQuesions/3) {
//   difficulty === "Easy";
// } else if (questionnumber > numberQuesions/3 && questionnumber <= (numberQuesions/3)*2) {
//   difficulty === "Medium";
// } else if (questionnumber > (numberQuesions/3)*2 && questionnumber <= numberQuesions) {
//   difficulty === "Hard";
// }
