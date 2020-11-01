# подключаем работу с приколюхами из операционной системы
import os
# подключаем работу с web-сервером
from flask import Flask, render_template, request
# подключаем работу с базой данных
import sqlite3

import json

#создаём web-сервер
app = Flask(__name__)

#подгрузка главной страницы
@app.route('/', methods=['post', 'get'])
def home_page():
  return render_template("index.html")

@app.route('/index.html', methods=['post', 'get'])
def index_page():
  return render_template("index.html")

#работа с Покупкой билетов
@app.route('/getClientID/<name>/<surname>', methods=['post'])
def getClientID(name, surname):
  wasClient = 0
  if request.method == 'POST':
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    print("name: ", name)
    print("surname: ", surname)

    cursor.execute(("SELECT * FROM clients WHERE name = '%s' AND surname = '%s'") % (name, surname))
    conn.commit()
    
    # проверка на то что список - не пустой
    for i in cursor.fetchall():
      idToReturn = i[0]
      wasClient = 1

    # если пустой, то добавляем пользователя и вытаскиваем из таблицы его ID
    if wasClient == 0:
      cursor.execute(("INSERT INTO clients(name, surname) VALUES('%s', '%s')") % (name, surname))
      conn.commit()
      cursor.execute(("SELECT PersonID FROM clients WHERE name = '%s' AND surname = '%s'") % (name, surname))
      conn.commit()
      for i in cursor.fetchall():
        idToReturn = i[0]

    cursor.close()
    conn.close()

    return str(idToReturn), 200

@app.route('/getShowByName/<show>', methods=['post'])
def getShowByName(show):
  if request.method == 'POST':
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute(("SELECT * FROM show WHERE title = '%s'") % (show))
    conn.commit()
    
    msg = cursor.fetchall()

    cursor.close()
    conn.close()

    return json.dumps(msg), 200

@app.route('/getShowByTicketId/<ticketId>', methods=['post'])
def getShowByTicketId(ticketId):
  if request.method == 'POST':
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    print("Start request")
    cursor.execute(("SELECT * FROM show WHERE ShowID IN" +
      "(SELECT sId FROM showProgramm WHERE ShowProgrammID IN" +
      "(SELECT showProgrammId FROM tickets WHERE TicketID = '%s'))") % (ticketId))
    conn.commit()
    print("End request")
    
    showName = cursor.fetchall()

    cursor.close()
    conn.close()
    return json.dumps(showName), 200


@app.route('/getNewPurchaseID/<name>/<surname>', methods=['post'])
def getNewPurchaseID(name, surname):
  if request.method == 'POST':
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    print("name: ", name)
    print("surname: ", surname)

    cursor.execute(("SELECT * FROM bills WHERE personId IN" +
      "(SELECT PersonID FROM clients WHERE name = '%s' AND surname = '%s')") % (name, surname))
    conn.commit()

    purchaseId = 0
    for i in cursor.fetchall():
      purchaseId = str(i[5])

    purchaseId = int(purchaseId) + 1
    cursor.close()
    conn.close()
    return str(purchaseId), 200

@app.route('/makePurchase/<personId>/<ticketId>/<count>/<date>/<purchaseId>', methods=['post'])
def makePurchase(personId, ticketId, count, date, purchaseId):
  if request.method == 'POST':
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute(("INSERT INTO bills(personId, ticketId, count, purchaseDate, personalPurchaseNum, isBuy) VALUES('%s', '%s', '%s', '%s', '%s', 1)") % (personId, ticketId, count, date, purchaseId))
    conn.commit()

    cursor.close()
    conn.close()
    return "complete", 200

@app.route('/getTheaterByShowProgrammId/<showProgrammId>', methods=['post'])
def getTheaterById(showProgrammId):
  if request.method == 'POST':
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute(("SELECT * FROM theaters WHERE TheaterID IN" +
      "(SELECT tId FROM showProgramm WHERE ShowProgrammID = '%s')") % (showProgrammId))
    conn.commit()

    msg = cursor.fetchall();

    cursor.close()
    conn.close()
    return json.dumps(msg), 200

@app.route('/getShowByShowProgrammId/<showProgrammId>', methods=['post'])
def getShowByShowProgrammId(showProgrammId):
  if request.method == 'POST':
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute(("SELECT * FROM show WHERE ShowID IN" +
      "(SELECT sId FROM showProgramm WHERE ShowProgrammID = '%s')") % (showProgrammId))
    conn.commit()

    msg = cursor.fetchall();

    cursor.close()
    conn.close()
    return json.dumps(msg), 200

@app.route('/returnCurrentTicketCount/<ticketId>/<totalCount>', methods=['post'])
def returnCurrentTicketCount(ticketId, totalCount):
  if request.method == 'POST':
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    print("ticketId: ", ticketId)
    print("totalCount: ", totalCount)

    cursor.execute(("SELECT * FROM bills WHERE ticketId = '%s'") % (ticketId))
    conn.commit()

    returnCount = int(totalCount)
    for i in cursor.fetchall():
      if i[6] == 1:
        returnCount -= int(i[3])
      elif i[6] == 0:
        returnCount += int(i[3])

    cursor.close()
    conn.close()
    return str(returnCount), 200

@app.route('/selectTickets/<city>/<show>', methods=['post'])
def selectTickets(city, show):
  if request.method == 'POST':
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    print("city: ", city)
    print("show: ", show)

    cursor.execute(("SELECT * FROM tickets WHERE showProgrammId IN" + 
    "(SELECT ShowProgrammID FROM showProgramm WHERE tId IN (SELECT TheaterID from theaters WHERE address = '%s')" + 
    "AND sId IN (SELECT ShowID from show WHERE title = '%s'))") % (city, show))
    
    conn.commit()

    msg = cursor.fetchall();

    cursor.close()
    conn.close()

    return json.dumps(msg), 200
    
@app.route('/buyTickets.html', methods=['post', 'get'])
def buyTickets_page():
  return render_template("buyTickets.html")

# работа с поиском билетов по городу и постановке
@app.route('/search.html', methods=['post', 'get'])
def search_page():
  message = ''
  if request.method == 'POST':
    city = request.form.get('city')
    show = request.form.get('show')

    print("city: ", city)
    print("show: ", show)

    conn = sqlite3.connect('database.db')
    cursor = conn.cursor() 

    cursor.execute(("SELECT * FROM theaters WHERE TheaterID IN" + 
    "(SELECT tId FROM showProgramm WHERE tId IN (SELECT TheaterID from theaters WHERE address = '%s')" + 
    "AND sId IN (SELECT ShowID from show WHERE title = '%s'))") % (city, show))
    
    conn.commit()

    notEmpty = 1
    for i in cursor.fetchall():
      if notEmpty == 1:
        notEmpty = 0
        message = "Данные выступления проходят в:"
      else:
        message += ", "
      message += str(i[1])

    cursor.close()
    conn.close()

  if message == '':
    message = "К сожалению, в Вашем городе в скором времени нет данной постановки..."
    print("going to print", message)
  return render_template("search.html", message = message)

# работа по выводу статистики
@app.route('/getAllShowsOfCity/<city>', methods=['post', 'get'])
def getAllShowsOfCity(city):
  if request.method == 'POST':
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute(("SELECT * FROM showProgramm WHERE tId IN" + 
      "(SELECT TheaterID FROM theaters WHERE address = '%s')") % (city))
    conn.commit()

    msg = cursor.fetchall();

    cursor.close()
    conn.close()
    return json.dumps(msg), 200

@app.route('/getTheaterByNameAndAddress/<name>/<address>', methods=['post', 'get'])
def getTheaterByNameAndAddress(name, address):
  if request.method == 'POST':
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute(("SELECT * FROM theaters WHERE name = '%s' AND address= '%s'") % (name, address))
    conn.commit()

    msg = cursor.fetchall();

    cursor.close()
    conn.close()
    return json.dumps(msg), 200

@app.route('/getShowProgrammByTheaterID/<theaterId>', methods=['post', 'get'])
def getShowProgrammByTheaterID(theaterId):
  if request.method == 'POST':
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute(("SELECT * FROM showProgramm WHERE tId = '%s'") % (theaterId))
    conn.commit()

    msg = cursor.fetchall();

    cursor.close()
    conn.close()
    return json.dumps(msg), 200

@app.route('/getTicketsByShowProgrammId/<spId>', methods=['post', 'get'])
def getTicketsByShowProgrammId(spId):
  if request.method == 'POST':
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute(("SELECT * FROM tickets WHERE showProgrammId = '%s'") % (spId))
    conn.commit()

    msg = cursor.fetchall();

    cursor.close()
    conn.close()
    return json.dumps(msg), 200

@app.route('/getPurchaseByTicketId/<tId>', methods=['post', 'get'])
def getPurchaseByTicketId(tId):
  if request.method == 'POST':
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute(("SELECT * FROM bills WHERE ticketId = '%s'") % (tId))
    conn.commit()

    msg = cursor.fetchall();

    cursor.close()
    conn.close()
    return json.dumps(msg), 200

@app.route('/getAllClients/', methods=['post', 'get'])
def getAllClients():
  if request.method == 'POST':
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute(("SELECT * FROM clients"))
    conn.commit()

    msg = cursor.fetchall();

    cursor.close()
    conn.close()
    return json.dumps(msg), 200

@app.route('/getMaxPurchaseId/<clientId>', methods=['post', 'get'])
def getMaxPurchaseId(clientId):
  if request.method == 'POST':
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute(("SELECT * FROM bills WHERE personId='%s'") % (clientId))
    conn.commit()

    maxPurcahseId = -1;
    for i in cursor.fetchall():
      if i[5] > maxPurcahseId:
        maxPurcahseId = i[5]

    cursor.close()
    conn.close()

    return str(maxPurcahseId), 200    

@app.route('/getPurchaseByPersonIdAndPurchaseId/<personId>/<purchaseId>', methods=['post', 'get'])
def getPurchaseByPersonIdAndPurchaseId(personId, purchaseId):
  if request.method == 'POST':
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute(("SELECT * FROM bills WHERE personId='%s' AND personalPurchaseNum='%s'") % (personId, purchaseId))
    conn.commit()

    msg = cursor.fetchall();

    cursor.close()
    conn.close()
    return json.dumps(msg), 200
    
@app.route('/getAllTheaters/', methods=['post', 'get'])
def getAllTheaters():
  if request.method == 'POST':
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute(("SELECT * FROM theaters"))
    conn.commit()

    msg = cursor.fetchall();

    cursor.close()
    conn.close()
    return json.dumps(msg), 200

@app.route('/getAllTickets/', methods=['post', 'get'])
def getAllTickets():
  if request.method == 'POST':
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute(("SELECT * FROM tickets"))
    conn.commit()

    msg = cursor.fetchall();

    cursor.close()
    conn.close()
    return json.dumps(msg), 200    

@app.route('/getAllPurchases/', methods=['post', 'get'])
def getAllPurchases():
  if request.method == 'POST':
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute(("SELECT * FROM bills"))
    conn.commit()

    msg = cursor.fetchall();

    cursor.close()
    conn.close()
    return json.dumps(msg), 200

@app.route('/stats.html', methods=['post', 'get'])
def stats_page():
  return render_template("stats.html")

# работа с Возвращением билетов
@app.route('/getPurchaseList/<name>/<surname>/<purchaseId>', methods=['post', 'get'])
def getPurchaseList(name, surname, purchaseId):
  if request.method == 'POST':
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    print("name: ", name)
    print("surname: ", surname)
    print("purchaseId: ", str(purchaseId))

    cursor.execute(("SELECT * FROM bills WHERE personalPurchaseNum='%s' AND personId IN (SELECT PersonID FROM clients WHERE name = '%s' AND surname = '%s')") % (str(purchaseId), name, surname))
    conn.commit()

    msg = cursor.fetchall();

    cursor.close()
    conn.close()
    return json.dumps(msg), 200

@app.route('/getTheaterByTicketId/<ticketId>', methods=['post'])
def getTheaterByTicketId(ticketId):
  if request.method == 'POST':
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute(("SELECT * FROM theaters WHERE TheaterID IN" +
      "(SELECT tId FROM showProgramm WHERE ShowProgrammID IN" +
      "(SELECT showProgrammId FROM tickets WHERE TicketID = '%s'))") % (ticketId))
    conn.commit()
    
    theater = cursor.fetchall()

    cursor.close()
    conn.close()
    return json.dumps(theater), 200

@app.route('/getTicketByTicketId/<ticketId>', methods=['post'])
def getTicketByTicketId(ticketId):
  if request.method == 'POST':
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute(("SELECT * FROM tickets WHERE TicketID = '%s'") % (ticketId))
    conn.commit()
    
    ticket = cursor.fetchall()

    cursor.close()
    conn.close()
    return json.dumps(ticket), 200

@app.route('/makeReturn/<personId>/<ticketId>/<count>/<date>/<purchaseId>', methods=['post'])
def makeReturn(personId, ticketId, count, date, purchaseId):
  if request.method == 'POST':
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute(("INSERT INTO bills(personId, ticketId, count, purchaseDate, personalPurchaseNum, isBuy) VALUES('%s', '%s', '%s', '%s', '%s', 0)") % (personId, ticketId, count, date, purchaseId))
    conn.commit()

    cursor.close()
    conn.close()
    return "complete", 200

@app.route('/returnTickets.html', methods=['post', 'get'])
def returnTickets_page():
  return render_template("returnTickets.html")

# мониторинг Базы данных через SQL запросы
@app.route('/base_edit.html', methods=['post', 'get'])
def base_edit_page():
  message = ''
  # если нам отправили SQL запрос
  if request.method == 'POST':
    # получим запрос из формы
    query = request.form.get('query')
    print("going to run", query)
    # подключимся к базе
    conn = sqlite3.connect('database.db')
    c = conn.cursor() 
    # выполним запрос
    c.execute(query)
    # применим все изменения
    conn.commit()
    # возьмём всё что нам вернули и засунем в message
    message = "\n".join([str(i) for i in c.fetchall()])
    # закроем соединение
    c.close()
    conn.close()
  # вывести то что лежит в директории templates в файле base_edit.html
  return render_template("base_edit.html", message = message)

# создание БД при первом подключении на компьютере
if __name__ == "__main__":
  # проверим, а есть ли у нас тут база данных?
  if not os.path.isfile("database.db"):
    # если нет - подключаемся и выполняем всё что лежит в файле base_struct.sql
    # (по факту её создаём)
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    qry = open("base_struct.sql").read()
    c.executescript(qry)
    conn.commit()
    c.close()
    conn.close()    
  app.debug = True 
  app.run()
