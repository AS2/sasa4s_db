window.onload = function() {
	var button = document.getElementById('search_submit'),
		choose_list = document.getElementById('search_list'),
		outputDiv = document.getElementById('search_result');

	var showTable;

	showTable = MakeXMLRequest('/getAllShows/');
	if (showTable == "**ERROR**")
		return;
	showTable = JSON.parse(showTable);

	for (i = 0; i < showTable.length; i++)
		choose_list.innerHTML += "<option>" + showTable[i][1] + "</option>";



	function returnTodayDateInStr () {
		var date = new Date(), dateToday = date.getFullYear()+"-";
		if ((date.getMonth()+1) < 10)
			dateToday += "0";
		dateToday += (date.getMonth()+1) + "-";
		if (date.getDate() < 10)
			dateToday += "0";
		dateToday += date.getDate() + "-";
		if (date.getHours() < 10)
			dateToday += "0";
		dateToday += date.getHours() + "-";
		if (date.getMinutes() < 10)
			dateToday += "0";
		dateToday += date.getMinutes();

		return dateToday;
	}

	function returnTodayDateInReadableStr (todayStr) {
		var outputStr = todayStr[8] + todayStr[9] + "/" + todayStr[5] + todayStr[6] + "/" + 
			todayStr[0] + todayStr[1] + todayStr[2] + todayStr[3] + " в " + 
			todayStr[11] + todayStr[12] + ":" + todayStr[14] + todayStr[15];

		return outputStr;
	}

	function MakeXMLRequest(str) {
		let XHR = new XMLHttpRequest();

		XHR.open('POST', str, false);
		XHR.send();
		if (XHR.status != 200) {
			alert(XHR.status + ': ' + XHR.statusText);
			return "**ERROR**";
		}		
		return XHR.responseText;
	}



	function SearchTickets() {
		var currentShow = document.getElementById('search_show').value, dateToday = returnTodayDateInStr();

		if (currentShow == "") {
			alert("Введите название шоу!");
			return;
		}

		wasShow = 0;
		for (i = 0; i < showTable.length; i++)
			if (currentShow == showTable[i][1]) {
				wasShow = 1;
				break;
			}
		if (wasShow == 0) {
			alert("Такого шоу не существует!");
			return;	
		}

		var showProgrammTable = MakeXMLRequest('/getShowProgrammByShowName/'+currentShow);
		if (showTable == "**ERROR**")
			return;
		showProgrammTable = JSON.parse(showProgrammTable);

		outputDiv.innerHTML = "";
		if (showProgrammTable.length == 0) {
			outputDiv.innerHTML = "К сожалению, билетов на данное шоу не существует";
			return;
		}

		for (i = 0; i < showProgrammTable.length; i++) {
			var theaterTable = JSON.parse(MakeXMLRequest('/getTheaterByShowProgrammId/' + showProgrammTable[i][0]));
			if (dateToday < showProgrammTable[i][3])
				outputDiv.innerHTML += "<p>Театр: \"" + theaterTable[0][1] + "\", дата: " + returnTodayDateInReadableStr(showProgrammTable[i][3]);
		}
	}

	button.onclick = SearchTickets;
}