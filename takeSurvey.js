var surveyNumber, surveyQuestions;

// Work-around for missing JQuery.postJSON
jQuery["postJSON"] = function(url,data,callback) {
	$.ajax({
	  url:url,
	  type:'POST',
	  data:JSON.stringify(data),
	  contentType:'application/json',
	  dataType:'json',
	  success: callback
	});
};

// Callback function for the GET query that fetches the survey details.
// We will want to display the survey title in the page along with the
// prompt text for the survey.
function showPrompt(data) {
	$('#title').text(data.title);
	$('#heading').text(data.title);
	$('#prompt').text(data.prompt);
}

// Callback function for the GET query that fetches the questions.
// This function will build the questions into the page
function buildQuestions(data) {
	surveyQuestions = data; // Save the questions in a global variable

	var n, length, parentDiv, questionDiv, choicesDiv, options;
	length = surveyQuestions.length;
	parentDiv = $('#survey');
	for(n = 0;n < length;n++) {
		// Each of the questions appears in its own div. The div contains a paragraph for the text
		// of the question and a div below that that displays radio buttons for the responses or a
		// text field for free response questions.

		// When setting up the text fields or the radio buttons we give each element a name attribute
		// that contains the index in the surveyQuestions array of the question that this element will
		// answer.
		questionDiv = $('<div>');
		questionDiv.append($('<p>').text(surveyQuestions[n].question));
		choicesDiv = $('<div>').addClass('col-sm-12');
		options = surveyQuestions[n].responses;
		if(options.length == 0) {
			choicesDiv.append($('<input>').attr('type','input').addClass('form-control').attr('name','text_'+n));
		} else {
			var m, split, newChoice;
			split = options.split(',');
			for(m = 0;m < split.length;m++) {
				newChoice = $('<label>').addClass('radio-inline');
				// For each option we set up a radio button. The value of the radio button element is
				// the option.
				newChoice.html('<input type="radio" name="radio_'+n+'" value="'+split[m].trim()+'">'+split[m]);
				choicesDiv.append(newChoice);
			}
		}
		choicesDiv.addClass('underline');
		questionDiv.append(choicesDiv);
		parentDiv.append(questionDiv);
	}
}

// Event handler for the submit button at the bottom of the page
function submitSurvey() {
	var n, length, response, choice, value;
	length = surveyQuestions.length;
	// For each of the questions stored in the global surveyQuestions array we need
	// to locate the user's response in the page and upload their response.
	for(n = 0;n < length;n++) {
		// The key to locating the user's responses are the name attributes we used
		// when setting up the questions in the page. These name attributes take the
		// form of text_<n> or radio_<n>, where <n> is the index in the surveyQuestions
		// array for the question that this element is linked to.
		// We can locate the elements in question by using JQuery selectors of the form
		// input[name="text_<n>"] or input[name="radio_<n>"]:checked
		if(surveyQuestions[n].responses.length==0) {
			choice = $("input[name='text_"+n+"']").val();
		} else {
			choice = $("input[name='radio_"+n+"']:checked").val();
		}
		// Assemble the response object for this question and post it to the server.
		response = {survey:surveyNumber,question:surveyQuestions[n].idquestion,response:choice};
		$.postJSON('https://cmsc106.net/survey/response',response);
	}
	// Hide the section that displays the questions and show the confirmation section.
	$('#one').hide();
	$('#two').show();
}

// Event handler for the document ready event
function setUp() {
	$('#submit').on('click',submitSurvey);

	// The survey id number should be embedded in the URL of this page.
	// We can access that URL at window.location.href.
	// The id number should appear after a # at the end of the URL, so we
	// can get it by splitting the URL on the # character and then just
	// grabbing item 1 from the array that results from the split.
	surveyNumber = (window.location.href.split('#'))[1];

	$('#two').hide();

	// Set up the two AJAX GET requests that will fetch the data on the survey and the list of questions.
	$.getJSON('https://cmsc106.net/survey/survey/'+surveyNumber,showPrompt);
	$.getJSON('https://cmsc106.net/survey/question?survey='+surveyNumber,buildQuestions);
}

$(document).ready(setUp);
