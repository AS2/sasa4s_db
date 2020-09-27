# подключаем работу с приколюхами из операционной системы
import os
# подключаем работу с web-сервером
from flask import Flask, render_template, request
# подключаем работу с базой данных
import sqlite3

#создаём web-сервер
app = Flask(__name__)

#если мы перейдём по ссылке
@app.route('/', methods=['post', 'get'])
def home_page():
  return render_template("index.html")

@app.route('/index.html', methods=['post', 'get'])
def index_page():
  return render_template("index.html")

@app.route('/purchase.html', methods=['post', 'get'])
def purchase_page():
  return render_template("purchase.html")

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

@app.route('/stats.html', methods=['post', 'get'])
def stats_page():
  return render_template("stats.html")

#если мы перейдём по ссылке /base_edit то
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
  # ебануть то что лежит в директории templates в файле base_edit.html
  return render_template("base_edit.html", message = message)

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
