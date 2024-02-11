var survey, questions, surveyNumber;

// Callback function for the GET query that fetches the responses for the survey
function showResponses(data) {
	$('#title').text(survey.title);

	var n, m, id, lengthOuter, lengthInner;
	var tabulator, newDiv, list;
	var allResponses, newParText;
	var resultDiv = $('#results');

	qLength = questions.length;
	rLength = data.length;
	// For each of the questions in the survey we are going to set up a div
	// in the results section.
	for(n = 0;n < qLength;n++) {
		id = questions[n].idquestion;
		// For each question we will display a count of the responses or a list
		// of all the free responses.
		if(questions[n].responses.length==0) {
			// For questions with a free response we set up an empty array to collect
			// the text of the responses...
			tabulator = [];
			// ... and iterate over all the responses looking for responses whose id
			// matches the id of the current question...
			for(m = 0;m < rLength;m++) {
				if(data[m].question == id)
					// ...and push each such response we find onto the tabulator array.
					tabulator.push(data[m].response);
			}
			// After collecting the responses for this question we make a div to display the
			// results. The various free response answers we collected in the tabulator go into
			// a ul element.
			newDiv = $('<div>');
			newDiv.append($('<p>').text(questions[n].question));
			list = $('<ul>');
			for(m = 0;m < tabulator.length;m++) {
				list.append($('<li>').text(tabulator[m]));
			}
			newDiv.append(list);
			newDiv.addClass('underline');
			resultDiv.append(newDiv);
		} else {
			// The strategy used to collect counts for the questions with a fixed
			// list of possible responses is a little more sophisticated. See the lecture
			// notes that accompany this example for a full explanation of what is
			// going on here.
			tabulator = {};
			allResponses = questions[n].responses.split(',');
			for(m = 0;m < allResponses.length;m++) {
				tabulator[allResponses[m].trim()] = 0;
			}
			for(m = 0;m < rLength;m++) {
				if(data[m].question == id)
					tabulator[data[m].response] = tabulator[data[m].response] + 1;
			}
			newDiv = $('<div>');
			newDiv.append($('<p>').text(questions[n].question));
			newParText = '';
			for(m = 0;m < allResponses.length;m++) {
				newParText = newParText + allResponses[m] + ':' + tabulator[allResponses[m].trim()] + ' ';
			}
			newDiv.append($('<p>').text(newParText));
			newDiv.addClass('underline');
			resultDiv.append(newDiv);
		}
	}
}

// Callback for the questions get
function receiveQuestions(data) {
	questions = data;
	$.getJSON('https://cmsc106.net/survey/response?survey='+surveyNumber,showResponses);
}

// Callback for the survey get
function receiveSurvey(data) {
	survey = data;
  $.getJSON('https://cmsc106.net/survey/question?survey='+surveyNumber,receiveQuestions);
}

function setUp() {
	surveyNumber = (window.location.href.split('#'))[1];

	// Fetch details of the survey and the responses
	$.getJSON('https://cmsc106.net/survey/survey/'+surveyNumber,receiveSurvey);
}

$(document).ready(setUp);
