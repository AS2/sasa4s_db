alert("JS connected!");

// 1 step
var buttonTo2Step = document.getElementById("to2step");
var name, surname;

function make2Step() {
	var nameInput = document.getElementById("firstname");
	var surnameInput = document.getElementById("secondname");

	name = nameInput.value;
	surname = surnameInput.value;
	alert("All done!");
}
buttonTo2Step.onclick = make2Step;

// 2 step  			
var currentFieldsCount = 1;

add.onclick = function() {
	currentFieldsCount += 1;
	document.getElementById("fields").innerHTML += "<p id=\"field"+currentFieldsCount+"\"><input type=\"text\" name=\"show" + currentFieldsCount + "\" placeholder=\"Постановка\"><input type=\"text\" name=\"city"+ currentFieldsCount +"\" placeholder=\"Город\"><select size=\"1\" name=\"theatre"+currentFieldsCount+"\"><option>Театр</option><option id=\"standartTheater"+currentFieldsCount+"\">--Выберете город и постановку--</option></select><select size=\"1\" name=\"ticketType"+currentFieldsCount+"\"><option>Тип билетов</option><option id=\"standartTicket"+currentFieldsCount+"\">--Выберете город и постановку--</option></select><input type=\"text\" name=\"count\" placeholder=\"Кол-во\"></p>";
};

delBut.onclick = function() {
	if (currentFieldsCount > 1) {
		document.getElementById("field"+ currentFieldsCount).innerHTML = "";
		document.getElementById("field"+ currentFieldsCount).remove();
		currentFieldsCount -= 1;
	}
};

//3 step