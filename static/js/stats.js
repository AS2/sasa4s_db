window.onload = function() {
	var buttonCityShows = document.getElementById('cityShows_output'),
		buttonSoldenTickets = document.getElementById('soldenTickets_output'),
		buttonSellsForYear = document.getElementById('sellsForYear_output'),
		buttonEmptySells = document.getElementById('emptySells_output'),
		buttonBestSells = document.getElementById('bestSells_output');

	function CorrectDate(dateStr) {
		dateStr += "-00-00";
		return dateStr;
	}

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

	function returnYesterDayFromDateStr (dayStr) {
		var date = new Date(), outputStr;
		var year = 0, month = 0, day = 0, hour = 0, minute = 0;
		var pos = 0;

		for (pos = 0; pos <= 3; pos++)
			year = year * 10 + Number(dayStr[pos]);
		for (pos = 5; pos <= 6; pos++)
			month = month * 10 + Number(dayStr[pos]);
		for (pos = 8; pos <= 9; pos++)
			day = day * 10 + Number(dayStr[pos]);
		for (pos = 11; pos <= 12; pos++)
			hour = hour * 10 + Number(dayStr[pos]);
		for (pos = 14; pos <= 15; pos++)
			minute = minute * 10 + Number(dayStr[pos]);

		var date = new Date(year, month - 1, day - 1, hour, minute), outputStr = date.getFullYear()+"-";
		if ((date.getMonth()+1) < 10)
			outputStr += "0";
		outputStr += (date.getMonth()+1) + "-";
		if (date.getDate() < 10)
			outputStr += "0";
		outputStr += date.getDate() + "-";
		if (date.getHours() < 10)
			outputStr += "0";
		outputStr += date.getHours() + "-";
		if (date.getMinutes() < 10)
			outputStr += "0";
		outputStr += date.getMinutes();

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
					sellsPerTicket = new Array(),
					ticketsCnt = new Array(),
					ticketsShowProgramms = new Array(),
					ticketsCosts = new Array(),
					ticketsDiscounts = new Array(),

					showProgramms = new Array(),
					ticketsPerShowProgramm = new Array(),
					firstShowProgramm = -1, currentTicketId;
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
						showProgrammTable = JSON.parse(MakeXMLRequest('/getShowProgrammByTicketId/'+currentPurchaseIdTable[k][2]));
						ticketTable = JSON.parse(MakeXMLRequest('/getTicketByTicketId/'+currentPurchaseIdTable[k][2]));

						ticketsIds.push(currentPurchaseIdTable[k][2]);
						sellsPerTicket.push(0);
						if (currentPurchaseIdTable[k][6] == 1)
							ticketsCnt.push(currentPurchaseIdTable[k][3]);
						else {
							ticketsCnt.push(String(-1 * Number(currentPurchaseIdTable[k][3])));
							// если билеты были возвращены накануне показа, то сохраняем половину их стоимости
							yesterdayDate = returnYesterDayFromDateStr(showProgrammTable[0][3]);
							if (currentPurchaseIdTable[k][4] >= returnYesterDayFromDateStr(showProgrammTable[0][3]) && currentPurchaseIdTable[k][4] <= showProgrammTable[0][3])
								sellsPerTicket[currentTicketId] += currentPurchaseIdTable[k][3] * ticketTable[0][3] * 0.5;
						}
						// заполняем массивы нужными параметрами
						ticketsShowProgramms.push(showProgrammTable[0][0]);
						ticketsCosts.push(ticketTable[0][3]);
						ticketsDiscounts.push(0);

						// добавляем шоу, если его не было
						wasShowProgramms = 0;
						for (l = 0; l < showProgramms.length; l++)
							if (showProgrammTable[0][0] == showProgramms[l]) {
								wasShowProgramms = 1;
								break;
							}
						if (wasShowProgramms == 0) {
							showProgramms.push(showProgrammTable[0][1]);
							ticketsPerShowProgramm.push(0);
						}
					}
					// если был билет в списке
					else {
						if (currentPurchaseIdTable[k][6] == 1)
							ticketsCnt[currentTicketId] += currentPurchaseIdTable[k][3];
						else {
							ticketsCnt[currentTicketId] -= currentPurchaseIdTable[k][3];
							showProgrammTable = JSON.parse(MakeXMLRequest('/getShowProgrammByTicketId/'+ticketsIds[currentTicketId]));
							// если билеты были возвращены накануне показа, то сохраняем половину их стоимости
							yesterdayDate = returnYesterDayFromDateStr(showProgrammTable[0][3]);
							if (currentPurchaseIdTable[k][4] >= returnYesterDayFromDateStr(showProgrammTable[0][3]) && currentPurchaseIdTable[k][4] <= showProgrammTable[0][3]) {
								ticketTable = JSON.parse(MakeXMLRequest('/getTicketByTicketId/'+ticketsIds[currentTicketId]));
								sellsPerTicket[currentTicketId] += currentPurchaseIdTable[k][3] * ticketTable[0][3] * 0.5;
							}
						}	
					}
				}

				// ищем первую постановку и кол-во билетов на каждую постановку
				for (k = 0; k < ticketsIds.length; k++) {
					if (ticketsCnt[k] != 0 && firstShowProgramm == -1)
						firstShowProgramm = ticketsShowProgramms[k];
					for (l = 0; l < showProgramms.length; l++)
						if (ticketsShowProgramms[k] == showProgramms[l]) {
							ticketsPerShowProgramm[l] += ticketsCnt[k];
							break;
						}
				}
			
				// расчитывем стоимость с каждого типа билета с учетом скидок
				for (k = 0; k < ticketsIds.length; k++) {
					if (ticketsShowProgramms[k] != firstShowProgramm)
						ticketsDiscounts[k] += 10;

					for (l = 0; l < showProgramms.length; l++)
						if (ticketsShowProgramms[k] == showProgramms[l]) {
							if (ticketsPerShowProgramm[l] > 10)
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
		var shows = new Array();
		var theaters = new Array();
		var dateToday = returnTodayDateInStr();

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

			if (dateToday <= allShowsTable[i][3]) {
				wasShow = 0;
				for (j = 0; j < shows.length; j++) {
					if (shows[j] == showTable[0][1] && theaters[j] == theaterTable[0][1]) {
						wasShow = 1;
						break;
					}
				}
				if (wasShow == 0) {
					outputDiv.innerHTML += "<p>Постановка: \"" + showTable[0][1] + "\", театр: \"" + theaterTable[0][1] + "\"</p>";
					shows.push(showTable[0][1]);
					theaters.push(theaterTable[0][1]);
				}
			}
		}
		if (outputDiv.innerHTML == " ") {
			alert('В данном городе нет выступлений');
			return;	
		}
	}

	function SoldenTickets() {
		var outputDiv = document.getElementById('soldenTickets_res'),
			theaterAddress = document.getElementById('soldenTickets_city').value,
			theaterName = document.getElementById('soldenTickets_theater').value,
			theaterTable;

		if (theaterAddress == "" || theaterName == "") {
			alert("Впишите данные");
			return;
		}
		theaterTable = JSON.parse(MakeXMLRequest('/getTheaterByNameAndAddress/' + theaterName + '/' + theaterAddress));
		if (theaterTable == "**ERROR**")
			return;

		if (theaterTable.length == 0) {
			alert("Данного театра не существует!");
			return;	
		}

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

			outputDiv.innerHTML += "<p>Постановка: \"" + currentShow[0][1] + "\"; Время: " + returnDateInReadableStr(showProgrammTable[i][3]) + " Продано " + (ticketsSold - ticketsReturned) + 
								   " из " + totalTickets + "</p>";
		}
	}

	function SellsForYear() {
		var outputAllYearDiv = document.getElementById('sellsForAllYear_res'),
			outputQuadYearDiv = document.getElementById('sellsForQuadYear_res');

		var date = new Date();
		var currentYear = String(date.getFullYear()), currentMonth = String(date.getMonth()+1);
		var yearBegin = currentYear + "-01-01-00-00", yearEnd = currentYear+"-12-31-23-59", quadBegin, quadEnd, totalYear = 0, totalQuad = 0;


		if (Number(currentMonth) >= 1 && Number(currentMonth) <= 3)
			quadBegin = currentYear + "-01-01-00-00", quadEnd = currentYear + "-03-31-23-59";
		else if (Number(currentMonth) >= 4 && Number(currentMonth) <= 6)
			quadBegin = currentYear + "-04-01-00-00", quadEnd = currentYear + "-06-30-23-59";
		else if (Number(currentMonth) >= 7 && Number(currentMonth) <= 9)
			quadBegin = currentYear + "-07-01-00-00", quadEnd = currentYear + "-09-30-23-59";
		else if (Number(currentMonth) >= 10 && Number(currentMonth) <= 12)
			quadBegin = currentYear + "-10-01-00-00", quadEnd = currentYear + "-12-31-23-59";

		outputAllYearDiv.innerHTML = "";
		outputQuadYearDiv.innerHTML = "";

		var allTheatersTable = JSON.parse(MakeXMLRequest('/getAllTheaters/')), 
		theatersIds = new Array(), theatersNames = new Array();
		for (i = 0; i < allTheatersTable.length; i++) {
			theatersIds.push(allTheatersTable[i][0]);
			theatersNames.push(allTheatersTable[i][1]);
		}

		var sellsPerTheater = GetSellsPerTheaterOnSomeTime(yearBegin, yearEnd, theatersIds);
		outputAllYearDiv.innerHTML += "<h3>Продажи по каждому театру ЗА ГОД</h3>"

		for (i = 0; i < sellsPerTheater.length; i++) {
			outputAllYearDiv.innerHTML += "<p>Театр \"" + theatersNames[i] + "\", сборы: " + sellsPerTheater[i] + "</p>";
			totalYear += sellsPerTheater[i];
		}
		outputAllYearDiv.innerHTML += "<p>ИТОГО: " + totalYear + "</p>";


		sellsPerTheater = GetSellsPerTheaterOnSomeTime(quadBegin, quadEnd, theatersIds);
		outputAllYearDiv.innerHTML += "<h3>Продажи по каждому театру ЗА КВАРТАЛ</h3>"

		for (i = 0; i < sellsPerTheater.length; i++) {
			outputQuadYearDiv.innerHTML += "<p>Театр \"" + theatersNames[i] + "\", сборы: " + sellsPerTheater[i] + "</p>";
			totalQuad += sellsPerTheater[i];
		}
		outputQuadYearDiv.innerHTML += "<p>ИТОГО: " + totalQuad + "</p>";
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

		if (dateBegin == "" || dateEnd == "") {
			alert("Впишите данные");
			return;
		}
		

		dateBegin = CorrectDate(dateBegin);
		dateEnd = CorrectDate(dateEnd); 
		if (dateEnd < dateBegin) {
			var tmp = dateBegin;
			dateBegin = dateEnd;
			dateEnd = tmp;
		}

		var ticketsTable = MakeXMLRequest('/getAllTickets/');
		if (ticketsTable == "**ERROR**")
			return;
		outputDiv.innerHTML = "";
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
			var showProgramm = MakeXMLRequest('/getShowProgrammByTicketId/' + ticketsTable[i][0]);
			if (showProgramm == "**ERROR**")
				return;
			showProgramm = JSON.parse(showProgramm);

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

			// если покупка билета не вошла в рассматриваемый интервал, а возврат вошел
			if ((ticketsSold - ticketsReturned) < 0) {
				ticketSold = ticketsReturned;
			}

			outputDiv.innerHTML += "<p>Постановка: \"" + show[0][1] + "\", театр: \"" + theater[0][1] + 
									"\", тип билета:\"" + ticketsTable[i][4] + "\", дата: " + returnDateInReadableStr(showProgramm[0][3]) +
									", Коэф: " + (ticketsSold - ticketsReturned) / ticketsTable[i][2] + "</p>";
		}
	}

	buttonCityShows.onclick = CityShows;
	buttonSoldenTickets.onclick = SoldenTickets;
	buttonSellsForYear.onclick = SellsForYear;
	buttonEmptySells.onclick = EmptySells;
	buttonBestSells.onclick = BestSells;
}