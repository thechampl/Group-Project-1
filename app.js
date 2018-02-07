// Firebase setup


// Initialize Firebase
// var config = {
//   apiKey: "AIzaSyCMbj3WWdbHZ5Of9DkgN1sBMwoOh0jrmd8",
//   authDomain: "slack-trivia-a81b8.firebaseapp.com",
//   databaseURL: "https://slack-trivia-a81b8.firebaseio.com",
//   projectId: "slack-trivia-a81b8",
//   storageBucket: "slack-trivia-a81b8.appspot.com",
//   messagingSenderId: "665823338618"
// };
// firebase.initializeApp(config);

// var database = firebase.database();

//On page load, get all users from Trivia channel and create players in firebase. Each player will have, playing: boolean, wins, losses, answer, prof pic

//Jessi Cord
var slackToken = 'xoxp-272287974608-273244613333-311222493126-e22d048827cc08d9c07469ba50940696';
var slackURL = "https://slack.com/api/users.list?token=" + slackToken;

$.ajax({
  url: "https://slack.com/api/users.list?token=xoxp-272287974608-273244613333-311222493126-e22d048827cc08d9c07469ba50940696",
  method: "GET"
}).done(function(response){

  console.log(response);

}).fail((xhr) => {
  if (xhr.status === 429) {
    $('#random').html(`<p>Rate limited. Try again in a minute.</p>`);
  }
  else {
    console.log(xhr);
  }
});

//Sameea Mughnee
$("#triviaSetUp").on("click", function"() {
  $.ajax({
    url: "https://opentdb.com/api.php?amount=" + numberQuestions "&=" + category + "&=" + difficulty + "&type=multiple&encode=url3986";,
    method: "GET"
  }).done(function(response){
  
    console.log(response);
    
  });
}

var numberQuestions = $("#numberQuestions").val();
var category = $("#category").val();
var difficulty = $("#difficulty").val(); 

var triviaURL = "https://opentdb.com/api.php?amount=" + numberQuestions "&=" + category + "&=" + difficulty + "&type=multiple&encode=url3986";


if (questionnumber <= numberQuestions/3) {
  difficulty === "Easy";
} else if (questionnumber > numberQuestions/3 && questionnumber <= (numberQuesions/3)*2) {
  difficulty === "Medium";
} else if (questionnumber > (numberQuestions/3)*2 && questionnumber <= numberQuesions) {
  difficulty === "Hard";
}

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

