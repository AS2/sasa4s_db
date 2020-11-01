window.onload = function() {
	var showsAndCitiesCnt = 1;
	var plusBut, minusBut, buttonTo3Step, endBuying, date = new Date();

	var name = new String(), surname = new String();
	let cities = new Array(),
		shows = new Array(),
		ticketsCntPerShow = new Array(),

		ticketsIds = new Array(),
		ticketsCounts = new Array(),
		ticketsCosts = new Array(),
		ticketsShowTitle = new Array(),

		showsDisconts = new Array(),
		firstShow = new String(), 
		showsFields = new Array(),
		citiesFields = new Array();

	let XHR = new XMLHttpRequest();

	var dateToday = String(date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate());

	// 1 step
	var buttonTo2Step = document.getElementById('to2step');

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

	function sellTickets() {
		var i, j;
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

				// считаем билеты на каждую постановку
				for (j = 0; j < shows.length; j++)
					if (ticketsShowTitle[i] == shows[j]) {
						ticketsCntPerShow[j]+=Number(clientsTickets);
						break;
					}
				totalTicketsCount += Number(clientsTickets);
			}

			if (totalTicketsCount != 0) {
				// Выбираем первой постановкой ту, в которой есть хотя бы 1 билет,
				// а всем остальным билетам на другие постановки добавляем скидку в 10%
				for (j = 0; j < ticketsIds.length; j++) {
					clientsTickets = document.getElementById("ticketId"+ticketsIds[j]).value;
					if (clientsTickets == "")
						clientsTickets = 0;					
					if (clientsTickets > 0) {
						firstShow = ticketsShowTitle[j];
						break;
					}
				}

				// оформляем покупку и рассчитываем скидку
				var clientsTickets, showName;
				var totalSum = 0;
				for (i = 0; i < ticketsIds.length; i++) {
					showsDisconts.push(0);
					if (ticketsShowTitle[i] != firstShow)
						showsDisconts[i] = showsDisconts[i] + 10;

					// рассчитываем скидку
					for (j = 0; j < shows.length; j++)
						if (ticketsShowTitle[i] == shows[j] && ticketsCntPerShow[j] > 10)
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
		var i, city, show, wasTickets = 0, j, k;
		// создание блока HTML со всеми билетами
		document.getElementById('3step').innerHTML= "<h2>3 шаг</h2>"+
													"<h3 id=\"step3Head\"></h3>"+
													"<div id=\"ticketsTypes\">" +
													"<div id=\"tickets\">" +
													"</div>" +
													"<button id=\"endBuying\">Закончить покупку</button>" +
													"</div>";
		alert(showsAndCitiesCnt);
		shows = [];
		cities = [];
		// проход по всем городам и постановкам
		for (i = 1; i <= showsAndCitiesCnt; i++) {
			city = document.getElementById('city'+i).value;
			show = document.getElementById('show'+i).value;

			// проверяем, было ли уже введено такое поле
			wasShowAndCity = 0;
			for (j = 0; j < showsFields.length; j++)
				if (city == citiesFields[j] && show == showsFields[j]) {
					wasShowAndCity = 1;
					break;
				}

			if (wasShowAndCity == 1)
				continue;

			citiesFields.push(city);
			showsFields.push(show);

			// если поля города и постановки не пустые
			if (city != "" && show != "") {
				// отправляем запрос на получение всех билетов на данную постановку в этом городе
				var ticketsList = JSON.parse(MakeXMLRequest('/selectTickets/'+city+'/'+show));
				if (ticketsList == "**ERROR**")
						return;
				// если список пустой, то выходим, иначе работаем со списком
				if (ticketsList.length == 0) {
					alert('empty');
					continue;
				}

				// проверка на то что постановка еще идет
				showCur = JSON.parse(MakeXMLRequest('/getShowByName/'+show));
				if (showCur == "**ERROR**")
					return;

				if (dateToday > String(showCur[0][4])) {
					alert(dateToday + ' ' + String(showCur[0][4]));
					alert('too late!');
					continue;
				}

				// говорим, что список билетов не пустой
				wasTickets = 1;
				// добавляем информативный текст
				document.getElementById('tickets').innerHTML += "<h4>Город: " + city + ", постановка: " + show +"</h4>";

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
						document.getElementById('tickets').innerHTML += "<p>Театр: " + theaterInfo[0][1] + ", билет \"" + ticketsList[j][5] +
																		"\", оставшееся количество:" + currentCount +
																		"\", цена 1 билета:" + ticketsList[j][4] +
																		"&nbsp;&nbsp;&nbsp;&nbsp;<input type=\"number\" id=\"ticketId" + ticketsList[j][0] + "\" placeholder=\"Кол-во\">"
																		"</p>";
					}

					if (Number(currentCount) <= 0) {
						// говорим, что билеты данного типа распроданы
						document.getElementById('tickets').innerHTML += "<p>Театр: " + theaterInfo[0][1] + ", билет \"" + ticketsList[j][5] +
																		"\"БИЛЕТЫ ЗАКОНЧИЛИСЬ!</p>";
					}
					// сохраняем ID, цены и количества билетов для проверки при завершении покупки (чтоб лишний раз не обращаться к серверу и не тратить время)
					ticketsIds.push(ticketsList[j][0]);
					ticketsCounts.push(currentCount);
					ticketsCosts.push(ticketsList[j][4]);
					ticketsShowTitle.push(show);
				}
				if (ticketsList.length != 0) {
					var wasShow = 0;
					for (k = 0; k < shows.length; k++) {
						if (show == shows[k])
							wasShow = 1;
					}
					if (wasShow == 0) {
						shows.push(show);
						ticketsCntPerShow.push(0);
					}
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
													"<h3>Выберете города и постановки</h3>"+
													"<div id=\"showsAndCities\">" +
													"<div id=\"rows\">" +
													"<p id=\"row1\"><input type=\"text\" id=\"city1\" placeholder=\"Город\">&nbsp;&nbsp;&nbsp;&nbsp;" +
													"<input type=\"text\" id=\"show1\" placeholder=\"Постановка\"></p>" +
													"</div>" +
													"<button id=\"moreSC\">+</button>" +
													"<button id=\"lessSC\">-</button>" +
													"<button id=\"to3step\">Далее</button>" +
													"</div>";

		plusBut = document.getElementById('moreSC');
		minusBut = document.getElementById('lessSC');
		function makeRow() {
			cities.splice(0, cities.length)
			shows.splice(0, shows.length)

			for (i = 1; i <= showsAndCitiesCnt; i++) {
				city = document.getElementById('city'+i).value;
				show = document.getElementById('show'+i).value;

				if (city != null)
					cities.push(city);
				if (show != null)
					shows.push(show);
			}

			showsAndCitiesCnt++;
			document.getElementById('rows').innerHTML += "<p id=\"row" + showsAndCitiesCnt + "\"><input type=\"text\" id=\"city" + showsAndCitiesCnt + "\" placeholder=\"Город\">" +
														 "<input type=\"text\" id=\"show" + showsAndCitiesCnt + "\" placeholder=\"Постановка\"></p>";

			for (i = 1; i <= showsAndCitiesCnt - 1; i++) {
				if (city != null)
					document.getElementById('city'+i).value = cities[i - 1];
				if (show != null)
					document.getElementById('show'+i).value = shows[i - 1];
			}
		}
		plusBut.onclick = makeRow;

		function deleteRow() {
			if (showsAndCitiesCnt >= 2) {
				cities.splice(0, cities.length)
				shows.splice(0, shows.length)

				for (i = 1; i <= showsAndCitiesCnt - 1; i++) {
					city = document.getElementById('city'+i).value;
					show = document.getElementById('show'+i).value;

					if (city != null)
						cities.push(city);
					if (show != null)
						shows.push(show);
				}
				document.getElementById('rows').innerHTML = 
					document.getElementById('rows').innerHTML.replace("<p id=\"row" + showsAndCitiesCnt + "\"><input type=\"text\" id=\"city" + showsAndCitiesCnt + "\" placeholder=\"Город\">" +
																	  "<input type=\"text\" id=\"show" + showsAndCitiesCnt + "\" placeholder=\"Постановка\"></p>", "");
				for (i = 1; i <= showsAndCitiesCnt - 1; i++) {
					if (city != null)
						document.getElementById('city'+i).value = cities[i - 1];
					if (show != null)
						document.getElementById('show'+i).value = shows[i - 1];
				}
				showsAndCitiesCnt--;
			}
		}
		minusBut.onclick = deleteRow;

		buttonTo3Step = document.getElementById('to3step');
		buttonTo3Step.onclick = make3Step;
	}
	buttonTo2Step.onclick = make2Step;

};