CREATE TABLE theaters (
    TheaterID INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    address TEXT
);

CREATE TABLE show (
    ShowID INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    author TEXT,
    dateBegin TEXT,
    dateEnd TEXT
);

CREATE TABLE showProgramm (
    ShowProgrammID INTEGER PRIMARY KEY AUTOINCREMENT,
    tId INTEGER,
    sId INTEGER
);

CREATE TABLE tickets (
    TicketID INTEGER PRIMARY KEY AUTOINCREMENT,
    showProgrammId INTEGER,
    totalCount INTEGER,
    currentCount INTEGER,
    price REAL,
    className TEXT
);

CREATE TABLE clients (
    PersonID INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    surname TEXT
);

CREATE TABLE bills (
    BillID INTEGER PRIMARY KEY AUTOINCREMENT,

    personId INTEGER,
    ticketId INTEGER,

    count INTEGER,
    purchaseDate TEXT,

    personalPurchaseNum INTEGER,

    isBuy INTEGER
);


INSERT INTO theaters(name, address) VALUES("The Big Theater", "Moscow");
INSERT INTO theaters(name, address) VALUES("TUZ", "SPb");
INSERT INTO theaters(name, address) VALUES("Mariinsky Theatre", "SPb");
INSERT INTO theaters(name, address) VALUES("MOD Club", "SPb");


INSERT INTO show(title, author, dateBegin, dateEnd) VALUES("Muzlo", "Haski", "2019-12-16", "2020-12-18");
INSERT INTO show(title, author, dateBegin, dateEnd) VALUES("HASHEstvie", "Russkoe Radio", "2021-08-08", "2021-08-15");
INSERT INTO show(title, author, dateBegin, dateEnd) VALUES("Spartak", "Aram Hachaturyan", "2021-01-17", "2021-12-21");
INSERT INTO show(title, author, dateBegin, dateEnd) VALUES("Noch Kino", "a lot", "2020-09-22", "2020-09-23");


INSERT INTO showProgramm(tId, sId) VALUES(1, 1);
INSERT INTO showProgramm(tId, sId) VALUES(4, 1);

INSERT INTO showProgramm(tId, sId) VALUES(2, 2);
INSERT INTO showProgramm(tId, sId) VALUES(1, 2);

INSERT INTO showProgramm(tId, sId) VALUES(3, 3);
INSERT INTO showProgramm(tId, sId) VALUES(2, 3);

INSERT INTO showProgramm(tId, sId) VALUES(4, 4);
INSERT INTO showProgramm(tId, sId) VALUES(3, 4);


INSERT INTO tickets(showProgrammId, totalCount, currentCount, price, className) VALUES(1, 200, 200, 600, "dancefloor");
INSERT INTO tickets(showProgrammId, totalCount, currentCount, price, className) VALUES(1, 100, 100, 1200, "VIP-coach");
INSERT INTO tickets(showProgrammId, totalCount, currentCount, price, className) VALUES(2, 100, 100, 350, "dancefloor");
INSERT INTO tickets(showProgrammId, totalCount, currentCount, price, className) VALUES(2, 50, 50, 600, "VIP-coach");
INSERT INTO tickets(showProgrammId, totalCount, currentCount, price, className) VALUES(2, 50, 50, 1200, "VIP-coach+Bar");

INSERT INTO tickets(showProgrammId, totalCount, currentCount, price, className) VALUES(3, 150, 150, 450, "dancefloor");
INSERT INTO tickets(showProgrammId, totalCount, currentCount, price, className) VALUES(3, 75, 75, 700, "VIP");
INSERT INTO tickets(showProgrammId, totalCount, currentCount, price, className) VALUES(4, 100, 100, 350, "dancefloor");
INSERT INTO tickets(showProgrammId, totalCount, currentCount, price, className) VALUES(4, 50, 50, 450, "VIP");
INSERT INTO tickets(showProgrammId, totalCount, currentCount, price, className) VALUES(4, 50, 50, 550, "VIP+authograph");

INSERT INTO tickets(showProgrammId, totalCount, currentCount, price, className) VALUES(5, 150, 150, 1000, "1st+2nd row");
INSERT INTO tickets(showProgrammId, totalCount, currentCount, price, className) VALUES(5, 600, 600, 850, "3d and more row");
INSERT INTO tickets(showProgrammId, totalCount, currentCount, price, className) VALUES(6, 25, 25, 600, "1st row");
INSERT INTO tickets(showProgrammId, totalCount, currentCount, price, className) VALUES(6, 50, 50, 500, "2-3 rows");
INSERT INTO tickets(showProgrammId, totalCount, currentCount, price, className) VALUES(6, 100, 100, 350, "4-7 rows");

INSERT INTO tickets(showProgrammId, totalCount, currentCount, price, className) VALUES(7, 200, 200, 600, "back rows");
INSERT INTO tickets(showProgrammId, totalCount, currentCount, price, className) VALUES(7, 200, 200, 800, "front rows");
INSERT INTO tickets(showProgrammId, totalCount, currentCount, price, className) VALUES(8, 100, 100, 350, "back rows");
INSERT INTO tickets(showProgrammId, totalCount, currentCount, price, className) VALUES(8, 50, 50, 600, "front rows");
INSERT INTO tickets(showProgrammId, totalCount, currentCount, price, className) VALUES(8, 50, 50, 1200, "VIP-coach");


INSERT INTO clients(name, surname) VALUES("Alex", "Sachuk");
INSERT INTO clients(name, surname) VALUES("Petr", "Strepetov");
INSERT INTO clients(name, surname) VALUES("Dima", "Potapov");
INSERT INTO clients(name, surname) VALUES("Ivan", "Zmanovski");
INSERT INTO clients(name, surname) VALUES("Vladimir", "Parusov");
INSERT INTO clients(name, surname) VALUES("Diana", "Kozhevnikova");
INSERT INTO clients(name, surname) VALUES("Ivan", "Popov");
INSERT INTO clients(name, surname) VALUES("Sasha", "Milanich");
INSERT INTO clients(name, surname) VALUES("Valeriy", "Zhmishenko");