window.onload = function() {
	var showsAndTheatersCnt = 1;
	var plusBut, minusBut, buttonTo3Step, endBuying;

	var name = new String(), surname = new String();
	let theaters = new Array(),
		shows = new Array(),
		times = new Array(),

		ticketsShowZone = new Array(),
		ticketsCntPerShowZone = new Array(),

		ticketsIds = new Array(),
		ticketsCounts = new Array(),
		ticketsCosts = new Array(),
		ticketsShowTitle = new Array(),

		showsDisconts = new Array(),
		firstShow = new String(), 

		showsFields = new Array(),
		theatersFields = new Array(),
		timesFields = new Array();

	let XHR = new XMLHttpRequest();

	// 1 step
	var buttonTo2Step = document.getElementById('to2step');

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

	function returnDateInReadableStr (dayStr) {
		var outputStr = dayStr[8] + dayStr[9] + "/" + dayStr[5] + dayStr[6] + "/" + 
			dayStr[0] + dayStr[1] + dayStr[2] + dayStr[3] + " в " + 
			dayStr[11] + dayStr[12] + ":" + dayStr[14] + dayStr[15];

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

	function MakeOptions(rowNum) {
		theater = document.getElementById('theater'+rowNum);
		show = document.getElementById('show'+rowNum);
		showDate = document.getElementById('showDate'+rowNum);
		var today = returnTodayDateInStr(), timesCnt = 0;

		if (theater.value == "" || show.value == "") {
			showDate.innerHTML = "<option disabled>Выберете постановку и театр</option>";
			return;
		}
		var showProgrammTable = MakeXMLRequest('/getShowProgrammByShowAndTheater/'+show.value+'/'+theater.value);
		if (showProgrammTable == "**ERROR**") {
			return;
		}
		if (showProgrammTable == "[]") {
			showDate.innerHTML = "<option disabled>Такой постановки нет</option>";
			return;
		}
		showDate.innerHTML = "";
		showProgrammTable = JSON.parse(showProgrammTable)
		for (i = 0; i < showProgrammTable.length; i++) {
			if (today <= showProgrammTable[i][3]) {
				showDate.innerHTML += "<option value=\""+ showProgrammTable[i][3] +"\">"+ showProgrammTable[i][3] +"</option>";
				timesCnt++;
			}
		}
		if (timesCnt == 0) {
			showDate.innerHTML = "<option disabled>Данная постановка закончилась</option>";
			return;	
		}
	}

	function sellTickets() {
		var i, j, dateToday = returnTodayDateInStr();
		wasFirst = 0;
		// если имя и фамилия - не пустые поля
		if (name != null && surname != null) {
			var personID, purchaseID;
			// регистрируем (или делаем вход) пользователя
			personID = MakeXMLRequest('/getClientID/'+name+'/'+surname);
			if (personID == "**ERROR**")
				return;

			// получаем новый личный номер покупки пользователя
			purchaseID = MakeXMLRequest('/getNewPurchaseID/'+name+'/'+surname);
			if (purchaseID == "**ERROR**")
				return;

			// проверяем список покупок на корректность, а также подсчитываем кол-во билетов каждой постановки для рассчета скидки
			var totalTicketsCount = 0;
			for (i = 0; i < ticketsIds.length; i++) {
				// проверка на корректность входных данных
				clientsTickets = document.getElementById("ticketId"+ticketsIds[i]).value;
				if (clientsTickets == "")
					clientsTickets = 0;
				if (Number(clientsTickets) > Number(ticketsCounts[i]) || Number(clientsTickets) < 0) {
					alert("Некорректные данные")
					return;
				}

				ticketsCntPerShowZone[ticketsShowZone[i]] += Number(clientsTickets);
				totalTicketsCount += Number(clientsTickets);
			}

			if (totalTicketsCount != 0) {
				// Выбираем первой постановкой ту, в которой есть хотя бы 1 билет,
				// а всем остальным билетам на другие постановки добавляем скидку в 10%
				for (j = 0; j < ticketsCntPerShowZone.length; j++)
					if (ticketsCntPerShowZone[j] > 0) {
						firstShow = j;
						break;
					}

				// оформляем покупку и рассчитываем скидку
				var clientsTickets, showName;
				var totalSum = 0;
				for (i = 0; i < ticketsIds.length; i++) {
					showsDisconts.push(0);
					if (ticketsShowZone[i] != firstShow)
						showsDisconts[i] = showsDisconts[i] + 10;

					// рассчитываем скидку
					for (j = 0; j < ticketsCntPerShowZone.length; j++)
						if (ticketsShowZone[i] == j && ticketsCntPerShowZone[j] > 10)
							showsDisconts[i] = showsDisconts[i] + 10;

					clientsTickets = document.getElementById("ticketId"+ticketsIds[i]).value;
					if (clientsTickets == "")
						clientsTickets = 0;

					if (clientsTickets != 0)
						var result = MakeXMLRequest('/makePurchase/'+personID+'/'+ticketsIds[i]+'/'+clientsTickets+'/'+dateToday+'/'+purchaseID);
					if (result == "**ERROR**") {
						alert("Can't buy tickets")
						return;
					}

					alert(showsDisconts[i]);
					totalSum += clientsTickets * ticketsCosts[i] * (100 - showsDisconts[i]) / 100;
				}
				// выводим чек
				alert('Личный номер заказа: ' + String(purchaseID) + '\nК оплате: ' + String(totalSum));
			}
			else
				alert('Вы не сделали покупок!');

			window.location="http://127.0.0.1:5000/index.html";
		}
	}

	function make3Step() {
		var i, theater, show, time, wasTickets = 0, j, k, dateToday = returnTodayDateInStr();
		// создание блока HTML со всеми билетами
		document.getElementById('3step').innerHTML= "<h2>3 шаг</h2>"+
													"<h3 id=\"step3Head\"></h3>"+
													"<div id=\"ticketsTypes\">" +
													"<div id=\"tickets\">" +
													"</div>" +
													"<button id=\"endBuying\">Закончить покупку</button>" +
													"</div>";
		shows = [];
		theaters = [];
		times = [];
		// проход по всем городам и постановкам
		for (i = 1; i <= showsAndTheatersCnt; i++) {
			theater = document.getElementById('theater'+i).value;
			show = document.getElementById('show'+i).value;
			time = document.getElementById('showDate'+i).value;

			// проверяем, было ли уже введено такое поле
			wasShowTheaterAndTime = 0;
			for (j = 0; j < showsFields.length; j++)
				if (theater == theatersFields[j] && show == showsFields[j] && time == timesFields[j]) {
					wasShowTheaterAndTime = 1;
					break;
				}

			if (wasShowTheaterAndTime == 1)
				continue;

			theatersFields.push(theater);
			timesFields.push(time);
			showsFields.push(show);

			// если поля города и постановки не пустые
			if (theater != "" && show != "" && time != "") {
				// отправляем запрос на получение всех билетов на данную постановку
				var ticketsList = JSON.parse(MakeXMLRequest('/selectTickets/' + theater + '/' + show + '/' + time));
				if (ticketsList == "**ERROR**")
						return;
				// если список пустой, то выходим, иначе работаем со списком
				if (ticketsList.length == 0) {
					alert('empty');
					continue;
				}

				// проверка на то что постановка еще идет
				if (dateToday > time) {
					alert('too late!');
					continue;
				}

				// говорим, что список билетов не пустой
				wasTickets = 1;
				// добавляем информативный текст
				document.getElementById('tickets').innerHTML += "<h4>\"" + show + "\", в \"" + theater + "\" на " + returnDateInReadableStr(time) +"</h4>";

				// выводим все типы билетов в этом городе и на эту постановку
				var currentCount, theaterInfo;
				for (j = 0; j < ticketsList.length; j++) {
					currentCount = -1;
					// получаем оставшееся количество билетов
					currentCount = MakeXMLRequest('/returnCurrentTicketCount/'+ticketsList[j][0]+'/'+ticketsList[j][2]);
					if (currentCount == "**ERROR**")
						return;
					if (Number(currentCount) < 0)
						continue;

					// получаем информацию о театре
					theaterInfo = JSON.parse(MakeXMLRequest('/getTheaterByShowProgrammId/'+ticketsList[j][1]));
					if (theaterInfo == "**ERROR**")
						return;
					if (theaterInfo.length == 0)
						continue;

					if (Number(currentCount) > 0) {
						// добавляем поле для покупки
						document.getElementById('tickets').innerHTML += "<p>Билет \"" + ticketsList[j][4] +
																		"\", оставшееся количество:" + currentCount +
																		"\", цена 1 билета:" + ticketsList[j][3] +
																		"&nbsp;&nbsp;&nbsp;&nbsp;<input type=\"number\" id=\"ticketId" + ticketsList[j][0] + "\" placeholder=\"Кол-во\">"
																		"</p>";
					}

					if (Number(currentCount) <= 0) {
						// говорим, что билеты данного типа распроданы
						document.getElementById('tickets').innerHTML += "<p>БИЛЕТЫ ЗАКОНЧИЛИСЬ!</p>";
					}
					// сохраняем ID, цены и количества билетов для проверки при завершении покупки (чтоб лишний раз не обращаться к серверу и не тратить время)
					ticketsIds.push(ticketsList[j][0]);
					ticketsCounts.push(currentCount);
					ticketsCosts.push(ticketsList[j][3]);
					ticketsShowTitle.push(show);
					ticketsShowZone.push(i - 1);
				}
				if (ticketsList.length != 0) {
					ticketsCntPerShowZone.push(0);
				}
			}
		}

		if (wasTickets == 0)
			document.getElementById('step3Head').innerHTML = "К сожалению, данных билетов нет в продаже";
		else
			document.getElementById('step3Head').innerHTML = "Выберете нужные билеты";

		endBuying = document.getElementById('endBuying');
		endBuying.onclick = sellTickets;
	}

	function make2Step() {
		var nameInput = document.getElementById('firstname');
		var surnameInput = document.getElementById('secondname');

		name = nameInput.value;
		surname = surnameInput.value;
		if (name == "" || surname == "") {
			alert("Некорректные данные");
			return;
		}

		document.getElementById('2step').innerHTML= "<h2>2 шаг</h2>"+
													"<h3>Выберете театры, постановки и даты</h3>"+
													"<div id=\"showsAndTheaters\">" +
													"<div id=\"rows\">" +
													"<p id=\"row1\"><input type=\"text\" id=\"theater1\" placeholder=\"Театр\">&nbsp;&nbsp;&nbsp;&nbsp;" +
													"<input type=\"text\" id=\"show1\" placeholder=\"Постановка\">&nbsp;&nbsp;&nbsp;&nbsp;" + 
													"<select id=\"showDate1\">" + 
													"<option disabled>Введите театр и постановку</option>" +
													"</select></p>" +
													"</div>" +
													"<button id=\"moreST\">+</button>&nbsp;" +
													"<button id=\"lessST\">-</button>&nbsp;" +
													"<button id=\"to3step\">Далее</button>&nbsp;" +
													"</div>";

		var dateInput = document.getElementById('showDate1');
		dateInput.onfocus = function(){ MakeOptions(1); };

		plusBut = document.getElementById('moreST');
		minusBut = document.getElementById('lessST');

		function makeRow() {
			showsAndTheatersCnt++;
			var newRowP = document.createElement("p");
			newRowP.id = String("row" + showsAndTheatersCnt);
			newRowP.innerHTML = "<input type=\"text\" id=\"theater" + showsAndTheatersCnt + "\" placeholder=\"Театр\">&nbsp;&nbsp;&nbsp;&nbsp;" +
								"<input type=\"text\" id=\"show" + showsAndTheatersCnt + "\" placeholder=\"Постановка\">&nbsp;&nbsp;&nbsp;&nbsp;" + 
								"<select id=\"showDate" + showsAndTheatersCnt + "\">" + 
								"<option disabled>Введите театр и постановку</option>" +
								"</select>"

			document.getElementById('rows').append(newRowP);

			var dateInput = document.getElementById('showDate'+showsAndTheatersCnt);
			dateInput.secretIdKey = showsAndTheatersCnt;
			dateInput.onfocus = function(){ MakeOptions(dateInput.secretIdKey); };
		}
		plusBut.onclick = makeRow;

		function deleteRow() {
			if (showsAndTheatersCnt >= 2) {
				var rowToDelete = document.getElementById('row'+showsAndTheatersCnt);
				rowToDelete.remove();
				showsAndTheatersCnt--;
			}
		}
		minusBut.onclick = deleteRow;

		buttonTo3Step = document.getElementById('to3step');
		buttonTo3Step.onclick = make3Step;
	}
	buttonTo2Step.onclick = make2Step;
};