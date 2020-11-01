window.onload = function() {
	var name, surname, purchaseId;
	var buttonTo2Step = document.getElementById('to2step');

	let XHR = new XMLHttpRequest(),

		shows = new Array(),
		ticketsCntPerShowBeforeReturn = new Array(),
		ticketsCntPerShowAfterReturn = new Array(),
		firstShowBeforeReturn, firstShowAfterReturn,

		ticketsCnt = new Array(),
		ticketsCosts = new Array(),
		ticketsIds = new Array(),
		ticketsShow = new Array(),
		ticketsDiscount = new Array(),

		ticketsStartShow = new Array(),
		ticketsEndShow = new Array(),
		date = new Date();

	var dateToday = String(date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate());

	// добавачное слагаемое, в котором находится 50% суммы за прошлые возвраты
	var oldPartOfCost = 0;

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
		for (i = 0; i < shows.length; i++) {
			ticketsCntPerShowBeforeReturn.push(0);
			ticketsCntPerShowAfterReturn.push(0);
		}
		for (i = 0; i < ticketsIds.length; i++) {
			if (ticketsCnt[i] != 0) {
				returnTicketsCnt = document.getElementById("ticketId" + ticketsIds[i]).value;
				if (returnTicketsCnt == "")
					returnTicketsCnt = 0;
				if (Number(returnTicketsCnt) < 0) {
					alert('Введите положительное число!')
					return;
				}
				else if (Number(returnTicketsCnt) > ticketsCnt[i]) {
					alert('Слишком много билетов!')
					return;
				}
				
				for (j = 0; j < shows.length; j++)
					if (ticketsShow[i] == shows[j]) {
						ticketsCntPerShowAfterReturn[j] += ticketsCnt[i] - Number(returnTicketsCnt);
						ticketsCntPerShowBeforeReturn[j] += ticketsCnt[i];
						break;
					}
			}
		}

		// считаем цену до возврата

		// выбираем первую постановку для расчета скидки
		for (j = 0; j < ticketsIds.length; j++) {
			if (ticketsCnt[j] > 0) {
				firstShowBeforeReturn = ticketsShow[j];
				break;
			}
		}

		// рассчитываем скидку с учетом постановки и кол-ва билетов
		for (i = 0; i < ticketsIds.length; i++) {
			// добавляем "0" в массив скидок для каждого билета соответственно
			ticketsDiscount.push(0);

			if (ticketsCnt[i] != 0) {
				if (ticketsShow[i] != firstShowBeforeReturn)
					ticketsDiscount[i] = ticketsDiscount[i] + 10;
				// рассчитываем скидку
				for (j = 0; j < shows.length; j++)
					if (ticketsShow[i] == shows[j] && ticketsCntPerShowBeforeReturn[j] > 10)
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
				returnTicketsCnt = document.getElementById("ticketId" + ticketsIds[i]).value;
				if (returnTicketsCnt == "")
					returnTicketsCnt = 0;
				// выбираем первую постановку для расчета скидки
				if (ticketsCnt[i] - returnTicketsCnt > 0) {
					firstShowAfterReturn = ticketsShow[i];
					break;
				}
			}

		// рассчитываем скидку с учетом постановки и кол-ва билетов а также сохраняем в БД редактирование заказа
		for (i = 0; i < ticketsIds.length; i++) {
			if (ticketsCnt[i] != 0) {
				// добавляем скидку за 2 постановку
				if (ticketsShow[i] != firstShowBeforeReturn)
					ticketsDiscount[i] = ticketsDiscount[i] + 10;

				// считываем кол-во возвращаемых билетов
				returnTicketsCnt = document.getElementById("ticketId" + ticketsIds[i]).value;
				if (returnTicketsCnt == "")
					returnTicketsCnt = 0;

				// добавляем скидку за >10 билетов
				for (j = 0; j < shows.length; j++)
					if (ticketsShow[i] == shows[j] && ticketsCntPerShowAfterReturn[j] > 10)
						ticketsDiscount[i] = ticketsDiscount[i] + 10;

				// добавляем к цене половину стоимости билетов, возвращенных накануне показа
				if (dateToday <= ticketsEndShow[i] && dateToday >= ticketsStartShow[i])
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
		alert("Вы вернули билеты. Cтарая стоимость: " + String(lastCost) + "\nНовая стоимость: "+ String(newCost) + "Итого вернули: " + String(lastCost - newCost));
		window.location="http://127.0.0.1:5000/index.html";
	}

	function make2Step() {
		// считываем данные о заказе
		name = document.getElementById('firstname').value;
		surname = document.getElementById('secondname').value;
		purchaseId = document.getElementById('purchaseId').value;

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
					showTable = JSON.parse(MakeXMLRequest('/getShowByTicketId/'+purchaseTable[i][2]));
					// если билеты были возвращены накануне показа, то сохраняем половину их стоимости
					if (purchaseTable[i][4] >= showTable[0][3] && purchaseTable[i][4] <= showTable[0][4]) {
						ticketTable = JSON.parse(MakeXMLRequest('/getTicketByTicketId/'+purchaseTable[i][2]));
						oldPartOfCost += purchaseTable[i][3] * ticketTable[0][4] * 0.5;
					}
				}
			}	
			// если билет уже был добавлен ранее, то меняем кол-во купленных билетов
			if (wasThatTicket == 1 && purchaseTable[i][6] == 1)
				ticketsCnt[currentTicketId] += purchaseTable[i][3];
			else if (wasThatTicket == 1 && purchaseTable[i][6] == 0) {
				ticketsCnt[currentTicketId] -= purchaseTable[i][3];
				// если билеты были возвращены накануне показа, то сохраняем половину их стоимости
				showTable = JSON.parse(MakeXMLRequest('/getShowByTicketId/'+ticketsIds[currentTicketId]));
				if (purchaseTable[i][4] >= showTable[0][3] && purchaseTable[i][4] <= showTable[0][4]) {
					ticketTable = JSON.parse(MakeXMLRequest('/getTicketByTicketId/'+ticketsIds[currentTicketId]));
					oldPartOfCost += purchaseTable[i][3] * ticketTable[0][4] * 0.5;
				}
			}
		}


		// добавляем все считанные с заказа билеты на страницу
		var i, wasThatShow = 0;
		for (i = 0; i < ticketsIds.length; i++) {
			// получаем данные о шоу конкретного билета
			showTable = JSON.parse(MakeXMLRequest('/getShowByTicketId/'+ticketsIds[i]));
			showName = showTable[0][1];

			// получаем данные о театре конкретного билета
			theaterTable = JSON.parse(MakeXMLRequest('/getTheaterByTicketId/'+purchaseTable[i][2]));
			theaterName = theaterTable[0][1];

			// получаем данные о самом билете
			ticketTable = JSON.parse(MakeXMLRequest('/getTicketByTicketId/'+purchaseTable[i][2]));
			ticketTypeName = ticketTable[0][5];
			ticketCost = ticketTable[0][4];

			// прим: мы сохраняем ВСЕ билеты, но выводим для возврата ТОЛЬКО те, чье кол-во больше "0" и которые еще в показе (чтоб соответственно честно сохранить скидку с учетом первой постановки)
			if (ticketsCnt[i] != 0 || dateToday <= showTable[0][4])
				document.getElementById('tickets').innerHTML += "<p>Театр: " + theaterName + ", постановка: \""+ showName +"\" билет \"" + ticketTypeName +
																"\", куплено:" + ticketsCnt[i] +
																", цена 1 билета:" + ticketCost +
																	"&nbsp;&nbsp;&nbsp;&nbsp;<input type=\"number\" id=\"ticketId" + ticketsIds[i] + "\" placeholder=\"Кол-во\">"
																	"</p>";

			// добавляем новое шоу в массив
			wasThatShow = 0;
			for (j = 0; j < shows.length; j++) 
				if (showName == shows[j]) {
					wasThatShow = 1;
					break;
				}
			if (wasThatShow == 0)
				shows.push(showName);

			// сохраняем информацию о билете (даже если он просрочен, чтоб правильно произвести перерасчет всех скидок)
			ticketsCosts.push(ticketCost);
			ticketsShow.push(showName);
			ticketsStartShow.push(showTable[0][3]);
			ticketsEndShow.push(showTable[0][4]);
		}

		// назначем функцию на нажатие кнопки
		var returnButton = document.getElementById('endReturn');
		returnButton.onclick = returnTickets;
	}
	// назначем функцию на нажатие кнопки
	buttonTo2Step.onclick = make2Step;
};