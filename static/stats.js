window.onload = function() {
	var buttonCityShows = document.getElementById('cityShows_output'),
		buttonSoldenTickets = document.getElementById('soldenTickets_output'),
		buttonSellsForYear = document.getElementById('sellsForYear_output'),
		buttonEmptySells = document.getElementById('emptySells_output'),
		buttonBestSells = document.getElementById('bestSells_output');

	var date = new Date(), dateToday = String(date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate());

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

	function GetSellsPerTheaterOnSomeTime(dateBegin, dateEnd, theatersIds) {
		var totalSellsPerTheater = [];
		
		var allTheatersTable = JSON.parse(MakeXMLRequest('/getAllTheaters/'));
		for (i = 0; i < allTheatersTable.length; i++)
			totalSellsPerTheater.push(0);

		var allClientsTable = JSON.parse(MakeXMLRequest('/getAllClients/'));
		for (i = 0; i < allClientsTable.length; i++) {
			var maxPurchaseId = MakeXMLRequest('/getMaxPurchaseId/' + allClientsTable[i][0]);
			if (maxPurchaseId == "**ERROR**")
				return;

			for (j = 0; j < maxPurchaseId; j++) {
				var currentPurchaseIdTable = JSON.parse(MakeXMLRequest('/getPurchaseByPersonIdAndPurchaseId/' + allClientsTable[i][0] + '/' + (j + 1)));

				// проверка на вхождение всей истории одного заказа в определенный интервал времени
				var isCorrect = 1;
				for (k = 0; k < currentPurchaseIdTable.length; k++)
					if (currentPurchaseIdTable[k][4] < dateBegin || currentPurchaseIdTable[k][4] > dateEnd) {
						isCorrect = 0;
						break;
					}
				if (isCorrect == 0)
					continue;

				// подводим рассчет всего заказа с учетом скидок

				// создаем массивы с информацией о билетах
				var ticketsIds = new Array(),
					ticketsShows = new Array(),
					ticketsCnt = new Array(),
					ticketsCosts = new Array(),
					sellsPerTicket = new Array(),
					ticketsDiscounts = new Array(),

					shows = new Array(),
					ticketsPerShow = new Array(),
					firstShow = "**-1**2**", currentTicketId;
				// обходим наш лист и собираем информацию о билетах
				for (k = 0; k < currentPurchaseIdTable.length; k++) {
					// проверяем наличие билета в массиве
					wasTicket = 0;
					for (l = 0; l < ticketsIds.length; l++)
						if (currentPurchaseIdTable[k][2] == ticketsIds[l]) {
							wasTicket = 1;
							break;
						}
					currentTicketId = l;

					// если не было билета в массиве, то инициализируем его
					if (wasTicket == 0) {
						showTable = JSON.parse(MakeXMLRequest('/getShowByTicketId/'+currentPurchaseIdTable[k][2]));
						ticketTable = JSON.parse(MakeXMLRequest('/getTicketByTicketId/'+currentPurchaseIdTable[k][2]));

						ticketsIds.push(currentPurchaseIdTable[k][2]);
						sellsPerTicket.push(0);
						if (currentPurchaseIdTable[k][6] == 1)
							ticketsCnt.push(currentPurchaseIdTable[k][3]);
						else {
							ticketsCnt.push(String(-1 * Number(currentPurchaseIdTable[k][3])));
							// если билеты были возвращены накануне показа, то сохраняем половину их стоимости
							if (currentPurchaseIdTable[k][4] >= showTable[0][3] && currentPurchaseIdTable[k][4] <= showTable[0][4])
								sellsPerTicket[currentTicketId] += currentPurchaseIdTable[i][3] * ticketTable[0][4] * 0.5;
						}
						// заполняем массивы нужными параметрами
						ticketsShows.push(showTable[0][1]);
						ticketsCosts.push(ticketTable[0][4]);
						ticketsDiscounts.push(0);

						// добавляем шоу, если его не было
						wasShow = 0;
						for (l = 0; l < shows.length; l++)
							if (showTable[0][1] == shows[l]) {
								wasShow = 1;
								break;
							}
						if (wasShow == 0) {
							shows.push(showTable[0][1]);
							ticketsPerShow.push(0);
						}
					}
					// если был билет в списке
					else {
						if (currentPurchaseIdTable[k][6] == 1)
							ticketsCnt[currentTicketId] += currentPurchaseIdTable[k][3];
						else {
							ticketsCnt[currentTicketId] -= currentPurchaseIdTable[k][3];
							showTable = JSON.parse(MakeXMLRequest('/getShowByTicketId/'+ticketsIds[currentTicketId]));
							// если билеты были возвращены накануне показа, то сохраняем половину их стоимости
							if (currentPurchaseIdTable[k][4] >= showTable[0][3] && currentPurchaseIdTable[k][4] <= showTable[0][4]) {
								ticketTable = JSON.parse(MakeXMLRequest('/getTicketByTicketId/'+ticketsIds[currentTicketId]));
								sellsPerTicket[currentTicketId] += currentPurchaseIdTable[i][3] * ticketTable[0][4] * 0.5;
							}
						}	
					}
				}

				// ищем первую постановку и кол-во билетов на каждую постановку
				for (k = 0; k < ticketsIds.length; k++) {
					if (ticketsCnt[k] != 0 && firstShow == "**-1**2**")
						firstShow = ticketsShows[k];
					for (l = 0; l < shows.length; l++)
						if (ticketsShows[k] == shows[l]) {
							ticketsPerShow[l] += ticketsCnt[k];
							break;
						}
				}
			
				// расчитывем стоимость с каждого типа билета с учетом скидок
				for (k = 0; k < ticketsIds.length; k++) {
					if (ticketsShows[k] != firstShow)
						ticketsDiscounts[k] += 10;

					for (l = 0; l < shows.length; l++)
						if (ticketsShows[k] == shows[l]) {
							if (ticketsPerShow[l] > 10)
								ticketsDiscounts[k] += 10;
							break;
						}

					sellsPerTicket[k] += ticketsCnt[k] * ticketsCosts[k] * (100 - ticketsDiscounts[k]) / 100;
					// добавляем к театральным сборам продажи каждого билета этих театров
					theaterOfThisTicket = JSON.parse(MakeXMLRequest('/getTheaterByTicketId/'+ ticketsIds[k]));
					for (l = 0; l < theatersIds.length; l++)
						if (theatersIds[l] == theaterOfThisTicket[0][0]) {
							totalSellsPerTheater[l] += sellsPerTicket[k];
							break;
						}
				}
			}
		}

		return totalSellsPerTheater;
	}

	function CityShows() {
		var city = document.getElementById('cityShows_city').value;

		if (city == '') {
			alert('Впишите город');
			return;
		}

		var allShowsTable = JSON.parse(MakeXMLRequest('/getAllShowsOfCity/' + city));
		if (allShowsTable.length == 0) {
			alert('В данном городе нет выступлений');
			return;
		}

		var theaterTable, showTable, outputDiv = document.getElementById('cityShows_res');
		outputDiv.innerHTML = " ";
		for (i = 0; i < allShowsTable.length; i++) {
			theaterTable = JSON.parse(MakeXMLRequest('/getTheaterByShowProgrammId/' + allShowsTable[i][0]));
			showTable = JSON.parse(MakeXMLRequest('/getShowByShowProgrammId/' + allShowsTable[i][0]));

			if (dateToday < showTable[0][4])
				outputDiv.innerHTML += "<p>Постановка: \"" + showTable[0][1] + "\", театр: \"" + theaterTable[0][1] + "\"</p>";
		}
	}

	function SoldenTickets() {
		var outputDiv = document.getElementById('soldenTickets_res'),
			theaterAddress = document.getElementById('soldenTickets_city').value,
			theaterName = document.getElementById('soldenTickets_theater').value,
			theaterTable = JSON.parse(MakeXMLRequest('/getTheaterByNameAndAddress/' + theaterName + '/' + theaterAddress));
		if (theaterTable == "**ERROR**")
			return;

		var showProgrammTable = JSON.parse(MakeXMLRequest('/getShowProgrammByTheaterID/' + theaterTable[0][0]));
		if (showProgrammTable == "**ERROR**")
			return;


		for (i = 0; i < showProgrammTable.length; i++) {
			var currentShow = JSON.parse(MakeXMLRequest('/getShowByShowProgrammId/' + showProgrammTable[i][0])),
				ticketsSold = 0, ticketsReturned = 0, totalTickets = 0;
			if (currentShow == "**ERROR**")
				continue;

			var ticketsTable = JSON.parse(MakeXMLRequest('/getTicketsByShowProgrammId/' + showProgrammTable[i][0]));
			if (ticketsTable == "**ERROR**")
				continue;

			for (j = 0; j < ticketsTable.length; j++) {
				totalTickets += ticketsTable[j][2];

				var purchaseTable = JSON.parse(MakeXMLRequest('/getPurchaseByTicketId/' + ticketsTable[j][0]));
				if (purchaseTable == "**ERROR**")
					continue;
				for (k = 0; k < purchaseTable.length; k++) {
					if (purchaseTable[k][6] == 1)
						ticketsSold += purchaseTable[k][3];
					else
						ticketsReturned += purchaseTable[k][3];
				}
			}

			outputDiv.innerHTML += "<p>Постановка: \"" + currentShow[0][1] + "\"; Продано " + (ticketsSold - ticketsReturned) + 
								   " из " + totalTickets + "</p>";
		}
	}

	function SellsForYear() {
		var outputAllYearDiv = document.getElementById('sellsForAllYear_res'),
			outputQuadYearDiv = document.getElementById('sellsForQuadYear_res');

		var currentYear = String(date.getFullYear()), currentMonth = String(date.getMonth()+1);
		var yearBegin = currentYear + "-1-1", yearEnd = currentYear+"-12-31", quadBegin, quadEnd;

		if (Number(currentMonth) >= 1 && Number(currentMonth) <= 3)
			quadBegin = currentYear + "-1-1", quadEnd = currentYear + "-3-31";
		else if (Number(currentMonth) >= 4 && Number(currentMonth) <= 6)
			quadBegin = currentYear + "-4-1", quadEnd = currentYear + "-6-30";
		else if (Number(currentMonth) >= 7 && Number(currentMonth) <= 9)
			quadBegin = currentYear + "-7-1", quadEnd = currentYear + "-9-30";
		else if (Number(currentMonth) >= 10 && Number(currentMonth) <= 12)
			quadBegin = currentYear + "-10-1", quadEnd = currentYear + "-12-31";

		var allTheatersTable = JSON.parse(MakeXMLRequest('/getAllTheaters/')), 
		theatersIds = new Array(), theatersNames = new Array();
		for (i = 0; i < allTheatersTable.length; i++) {
			theatersIds.push(allTheatersTable[i][0]);
			theatersNames.push(allTheatersTable[i][1]);
		}

		var sellsPerTheater = GetSellsPerTheaterOnSomeTime(yearBegin, yearEnd, theatersIds);
		outputAllYearDiv.innerHTML += "<h3>Продажи по каждому театру ЗА ГОД</h3>"

		for (i = 0; i < sellsPerTheater.length; i++)
			outputAllYearDiv.innerHTML += "<p>Театр \"" + theatersNames[i] + "\", сборы: " + sellsPerTheater[i] + "</p>";

		sellsPerTheater = GetSellsPerTheaterOnSomeTime(quadBegin, quadEnd, theatersIds);
		outputAllYearDiv.innerHTML += "<h3>Продажи по каждому театру ЗА КВАРТАЛ</h3>"

		for (i = 0; i < sellsPerTheater.length; i++)
			outputQuadYearDiv.innerHTML += "<p>Театр \"" + theatersNames[i] + "\", сборы: " + sellsPerTheater[i] + "</p>";
	}

	function EmptySells() {
		var soldenTickets = 0, returnedTickets = 0, outputDiv = document.getElementById('emptySells_res');
		var purchaseTable = MakeXMLRequest('/getAllPurchases/');
		if (purchaseTable == "**ERROR**")
			return;
		
		purchaseTable = JSON.parse(purchaseTable);
		for (i = 0; i < purchaseTable.length; i++) {
			if (purchaseTable[i][6] == 1)
				soldenTickets += purchaseTable[i][3];
			else
				returnedTickets += purchaseTable[i][3];
		}

		if ((soldenTickets - returnedTickets) == 0)
			outputDiv.innerHTML = "Не было продано ни одного билета!";
		else
			outputDiv.innerHTML = "Коэффициент \"пустых\" продаж: " + returnedTickets / (soldenTickets - returnedTickets);
	}

	function BestSells() {
		var dateBegin = document.getElementById("bestSells_begin").value, dateEnd = document.getElementById("bestSells_end").value,
			outputDiv = document.getElementById('bestSells_res');
			
		var ticketsTable = MakeXMLRequest('/getAllTickets/');
		if (ticketsTable == "**ERROR**")
			return;
		ticketsTable = JSON.parse(ticketsTable);
		for (i = 0; i < ticketsTable.length; i++) {
			var ticketsSold = 0, ticketsReturned = 0;
			var show = MakeXMLRequest('/getShowByTicketId/' + ticketsTable[i][0]);
			if (show == "**ERROR**")
				return;
			show = JSON.parse(show);
			var theater = MakeXMLRequest('/getTheaterByTicketId/' + ticketsTable[i][0]);
			if (theater == "**ERROR**")
				return;
			theater = JSON.parse(theater);

			var purchaseTable = MakeXMLRequest('/getPurchaseByTicketId/' + ticketsTable[i][0]);
			if (purchaseTable == "**ERROR**")
				continue;
			purchaseTable = JSON.parse(purchaseTable);
			for (k = 0; k < purchaseTable.length; k++) {
				if (purchaseTable[k][4] >= String(dateBegin) && purchaseTable[k][4] <= String(dateEnd)) {
					if (purchaseTable[k][6] == 1)
						ticketsSold += purchaseTable[k][3];
					else
						ticketsReturned += purchaseTable[k][3];
				}
			}

			outputDiv.innerHTML += "<p>Постановка: \"" + show[0][1] + "\", театр: \"" + theater[0][1] + 
									"\", тип билета:\"" + ticketsTable[i][5] + 
									"\" Коэффициент \"успешности\": " + (ticketsSold - ticketsReturned) / ticketsTable[i][2] + "</p>";
		}
	}

	buttonCityShows.onclick = CityShows;
	buttonSoldenTickets.onclick = SoldenTickets;
	buttonSellsForYear.onclick = SellsForYear;
	buttonEmptySells.onclick = EmptySells;
	buttonBestSells.onclick = BestSells;
}