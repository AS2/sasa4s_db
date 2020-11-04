window.onload = function() {
	var name, surname, purchaseId;
	var buttonTo2Step = document.getElementById('to2step');

	let XHR = new XMLHttpRequest(),

		showProgramms = new Array(),
		ticketsCntPerShowProgrammBeforeReturn = new Array(),
		ticketsCntPerShowProgrammAfterReturn = new Array(),
		firstShowProgrammBeforeReturn, firstShowProgrammAfterReturn,

		ticketsIds = new Array(),
		ticketsCnt = new Array(),
		ticketsCosts = new Array(),
		ticketsTime = new Array(),
		ticketsShowProgramm = new Array(),

		ticketsDiscount = new Array(),
		dateToday;

	// добавачное слагаемое, в котором находится 50% суммы за прошлые поздние возвраты
	var oldPartOfCost = 0;

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

		for (i = 0; i <= 3; i++)
			year = year * 10 + Number(dayStr[i]);
		for (i = 5; i <= 6; i++)
			month = month * 10 + Number(dayStr[i]);
		for (i = 8; i <= 9; i++)
			day = day * 10 + Number(dayStr[i]);
		for (i = 11; i <= 12; i++)
			hour = hour * 10 + Number(dayStr[i]);
		for (i = 14; i <= 15; i++)
			minute = minute * 10 + Number(dayStr[i]);

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

	function returnTickets() {
		var i, city, show;

		alert("START RETURN!");

		// ищем человека в базе данных
		personID = MakeXMLRequest('/getClientID/'+name+'/'+surname);
		if (personID == "**ERROR**") {
			alert("неправильный персон_айди");
			return;
		}

		// провекрка корректности входных данных и инициализация нужных переменных
		var newCost = 0, lastCost = 0, boughtTicketsCnt = 0, returnTicketsCnt = 0;
		for (i = 0; i < showProgramms.length; i++) {
			ticketsCntPerShowProgrammBeforeReturn.push(0);
			ticketsCntPerShowProgrammAfterReturn.push(0);
		}
		for (i = 0; i < ticketsIds.length; i++) {
			if (ticketsCnt[i] != 0) {
				if (dateToday <= ticketsTime[i]) {
					returnTicketsCnt = document.getElementById("ticketId" + ticketsIds[i]).value;
					if (returnTicketsCnt == "")
						returnTicketsCnt = 0;
					if (Number(returnTicketsCnt) < 0) {
						alert('Введите положительное число!')
						return;
					}
					else if (Number(returnTicketsCnt) > ticketsCnt[i]) {
						alert('Нельзя вернуть так много билетов!')
						return;
					}
				}
				else
					returnTicketsCnt = 0;
				
				for (j = 0; j < showProgramms.length; j++)
					if (ticketsShowProgramm[i] == showProgramms[j]) {
						ticketsCntPerShowProgrammAfterReturn[j] += ticketsCnt[i] - Number(returnTicketsCnt);
						ticketsCntPerShowProgrammBeforeReturn[j] += ticketsCnt[i];
						break;
					}
			}
		}

		// считаем цену до возврата

		// выбираем первую постановку для расчета скидки
		for (j = 0; j < ticketsIds.length; j++) {
			if (ticketsCnt[j] > 0) {
				firstShowProgrammBeforeReturn = ticketsShowProgramm[j];
				break;
			}
		}

		// рассчитываем скидку с учетом постановки и кол-ва билетов
		for (i = 0; i < ticketsIds.length; i++) {
			// добавляем "0" в массив скидок для каждого билета соответственно
			ticketsDiscount.push(0);

			if (ticketsCnt[i] != 0) {
				if (ticketsShowProgramm[i] != firstShowProgrammBeforeReturn)
					ticketsDiscount[i] = ticketsDiscount[i] + 10;
				// рассчитываем скидку
				for (j = 0; j < showProgramms.length; j++)
					if (ticketsShowProgramm[i] == showProgramms[j] && ticketsCntPerShowProgrammBeforeReturn[j] > 10)
						ticketsDiscount[i] = ticketsDiscount[i] + 10;

				lastCost += ticketsCnt[i] * ticketsCosts[i] * (100 - ticketsDiscount[i]) / 100;

				// обнуляем для будущего перерасчета
				ticketsDiscount[i] = 0;
			}
		}
		// добавляем к итоговой цене ту часть с первого перерасчета
		lastCost += oldPartOfCost;

		// считаем цену после возврата
		for (i = 0; i < ticketsIds.length; i++) 
			if (ticketsCnt[i] != 0) {
				if (dateToday <= ticketsTime[i]) {
					returnTicketsCnt = document.getElementById("ticketId" + ticketsIds[i]).value;
					if (returnTicketsCnt == "")
						returnTicketsCnt = 0;
				}
				else
					returnTicketsCnt = 0;
				// выбираем первую постановку для расчета скидки
				if (ticketsCnt[i] - returnTicketsCnt > 0) {
					firstShowProgrammAfterReturn = ticketsShowProgramm[i];
					break;
				}
			}

		// рассчитываем скидку с учетом постановки и кол-ва билетов а также сохраняем в БД редактирование заказа
		for (i = 0; i < ticketsIds.length; i++) {
			if (ticketsCnt[i] != 0) {
				// добавляем скидку за 2 постановку
				if (ticketsShowProgramm[i] != firstShowProgrammBeforeReturn)
					ticketsDiscount[i] = ticketsDiscount[i] + 10;

				if (dateToday <= ticketsTime[i]) {
					// считываем кол-во возвращаемых билетов
					returnTicketsCnt = document.getElementById("ticketId" + ticketsIds[i]).value;
					if (returnTicketsCnt == "")
						returnTicketsCnt = 0;
				}
				else
					returnTicketsCnt = 0;

				// добавляем скидку за >10 билетов
				for (j = 0; j < showProgramms.length; j++)
					if (ticketsShowProgramm[i] == showProgramms[j] && ticketsCntPerShowProgrammAfterReturn[j] > 10)
						ticketsDiscount[i] = ticketsDiscount[i] + 10;

				// добавляем к цене половину стоимости билетов, возвращенных накануне показа
				yesterdayDate = returnYesterDayFromDateStr(ticketsTime[i]);
				if (dateToday <= ticketsTime[i] && dateToday >= yesterdayDate)
					newCost += Number(ticketsCosts[i]) * Number(returnTicketsCnt) * 0.5;
				// добавляем к цене оставшуюся часть билетов с учетом их скидки
				newCost += Number(ticketsCosts[i]) * Number(ticketsCnt[i] - returnTicketsCnt) * (100 - Number(ticketsDiscount[i])) / 100;	

				// если возвращают "0" билетов, то не записываем в БД
				if (returnTicketsCnt != 0) {
					var answer = MakeXMLRequest('/makeReturn/'+personID+'/'+ticketsIds[i]+'/'+returnTicketsCnt+'/'+dateToday+'/'+purchaseId);
					if (answer == "**ERROR**")
						return;
				}
			}
		}
		// добавляем к итоговой цене ту часть с первого перерасчета
		newCost += oldPartOfCost;

		// вывод и переадресация пользователя на главную страницу
		alert("Вы вернули билеты. Cтарая стоимость: " + String(lastCost) + "\nНовая стоимость: "+ String(newCost) + ". Итого вернули: " + String(lastCost - newCost));
		window.location="http://127.0.0.1:5000/index.html";
	}

	function make2Step() {
		// считываем данные о заказе
		name = document.getElementById('firstname').value;
		surname = document.getElementById('secondname').value;
		purchaseId = document.getElementById('purchaseId').value;
		dateToday = returnTodayDateInStr();

		if (name == "" || surname == "" || purchaseId == "" || purchaseId <= 0) {
			alert("Некорректные данные");
			return;
		}

		// получаем всю историю заказа из БД
		purchaseTable = JSON.parse(MakeXMLRequest('/getPurchaseList/'+name+'/'+surname+'/'+purchaseId));
		if (purchaseTable.length == 0) {
			alert("Неправильные данные.");
			return;
		}

		// создаем поля для вывода ответа сервера и страницы
		document.getElementById('2step').innerHTML= "<h2>2 шаг</h2>"+
													"<h3 id=\"step3Head\">Выберете кол-во билетов, которое хоитите вернуть</h3>"+
													"<div id=\"ticketsTypes\">" +
													"<div id=\"tickets\">" +
													"</div>" +
													"<button id=\"endReturn\">Вернуть билеты</button>" +
													"</div>";

		// чистим поле для ввода
		document.getElementById('tickets').innerHTML = "";

		// заранее чистим все массивы, если в них было что то записано с прошлого нажатия "Далее"
		ticketsIds = [];
		ticketsCnt = [];
		ticketsCosts = [];
		ticketsTime = [];
		ticketsShowProgramm = [];
		ticketsCntPerShowProgramm = [];
		oldPartOfCost = 0;

		// проводим перерасчет билетов в заказе
		var wasThatTicket = 0, currentTicketId;
		for (i = 0; i < purchaseTable.length; i++) {
			// ищем билет в массиве
			wasThatTicket = 0;
			for (j = 0; j < ticketsIds.length; j++)
				if (purchaseTable[i][2] == ticketsIds[j]) {
					wasThatTicket = 1;
					currentTicketId = j;
					break;
				}

			// если билета нет, то добавляем его айди и кол-во в массивы
			currentTicketId = j;
			if (wasThatTicket == 0) {
				ticketsIds.push(purchaseTable[i][2]);
				if (purchaseTable[i][6] == 1)
					ticketsCnt.push(purchaseTable[i][3]);
				else {
					ticketsCnt.push(String(-1 * Number(purchaseTable[i][3])));
					showProgrammTable = JSON.parse(MakeXMLRequest('/getShowProgrammByTicketId/'+purchaseTable[i][2]));
					// если билеты были возвращены накануне показа, то сохраняем половину их стоимости
					yesterdayDate = returnYesterDayFromDateStr(showProgrammTable[0][3]);
					if (purchaseTable[i][4] <= showProgrammTable[0][3] && purchaseTable[i][4] >= yesterdayDate) {
						ticketTable = JSON.parse(MakeXMLRequest('/getTicketByTicketId/'+purchaseTable[i][2]));
						oldPartOfCost += purchaseTable[i][3] * ticketTable[0][3] * 0.5;
					}
				}
			}	
			// если билет уже был добавлен ранее, то меняем кол-во купленных билетов
			if (wasThatTicket == 1 && purchaseTable[i][6] == 1)
				ticketsCnt[currentTicketId] += purchaseTable[i][3];
			else if (wasThatTicket == 1 && purchaseTable[i][6] == 0) {
				ticketsCnt[currentTicketId] -= purchaseTable[i][3];
				// если билеты были возвращены накануне показа, то сохраняем половину их стоимости
				showProgrammTable = JSON.parse(MakeXMLRequest('/getShowProgrammByTicketId/'+purchaseTable[i][2]));
				// если билеты были возвращены накануне показа, то сохраняем половину их стоимости
				yesterdayDate = returnYesterDayFromDateStr(showProgrammTable[0][3]);
				if (purchaseTable[i][4] <= showProgrammTable[0][3] && purchaseTable[i][4] >= yesterdayDate) {
					ticketTable = JSON.parse(MakeXMLRequest('/getTicketByTicketId/'+ticketsIds[currentTicketId]));
					oldPartOfCost += purchaseTable[i][3] * ticketTable[0][3] * 0.5;
				}
			}
		}


		// добавляем все считанные с заказа билеты на страницу
		var i, wasThatShow = 0;
		for (i = 0; i < ticketsIds.length; i++) {
			// получаем данные о постановки конкретного билета
			showProgrammTable = JSON.parse(MakeXMLRequest('/getShowProgrammByTicketId/'+ticketsIds[i]));

			// получаем данные о шоу конкретного билета
			showTable = JSON.parse(MakeXMLRequest('/getShowByTicketId/'+ticketsIds[i]));
			showName = showTable[0][1];

			// получаем данные о театре конкретного билета
			theaterTable = JSON.parse(MakeXMLRequest('/getTheaterByTicketId/'+purchaseTable[i][2]));
			theaterName = theaterTable[0][1];

			// получаем данные о самом билете
			ticketTable = JSON.parse(MakeXMLRequest('/getTicketByTicketId/'+purchaseTable[i][2]));
			ticketTypeName = ticketTable[0][4];
			ticketCost = ticketTable[0][3];

			// прим: мы сохраняем ВСЕ билеты, но выводим для возврата ТОЛЬКО те, чье кол-во больше "0" и которые еще в показе (чтоб соответственно честно сохранить скидку с учетом первой постановки)
			if (ticketsCnt[i] != 0 && dateToday <= showProgrammTable[0][3])
				document.getElementById('tickets').innerHTML += "<p>Театр: " + theaterName + ", постановка: \""+ showName +"\", время:" + returnDateInReadableStr(showProgrammTable[0][3]) + ", билет \"" + ticketTypeName +
																"\", куплено:" + ticketsCnt[i] +
																", цена 1 билета:" + ticketCost +
																	"&nbsp;&nbsp;&nbsp;&nbsp;<input type=\"number\" id=\"ticketId" + ticketsIds[i] + "\" placeholder=\"Кол-во\">"
																	"</p>";

			// добавляем новое шоу в массив
			wasThatShowProgramm = 0;
			for (j = 0; j < showProgramms.length; j++) 
				if (showProgrammTable[0][0] == showProgramms[j]) {
					wasThatShowProgramm = 1;
					break;
				}
			if (wasThatShowProgramm == 0)
				showProgramms.push(showProgrammTable[0][0]);

			// сохраняем информацию о билете (даже если он просрочен, чтоб правильно произвести перерасчет всех скидок)
			ticketsCosts.push(ticketCost);
			ticketsShowProgramm.push(showProgrammTable[0][0]);
			ticketsTime.push(showProgrammTable[0][3]);
		}

		// назначем функцию на нажатие кнопки
		var returnButton = document.getElementById('endReturn');
		returnButton.onclick = returnTickets;
	}
	// назначем функцию на нажатие кнопки
	buttonTo2Step.onclick = make2Step;
};