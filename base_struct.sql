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

CREATE TABLE tickets (
    TicketID INTEGER PRIMARY KEY AUTOINCREMENT,
    theatreId INTEGER,
    showId INTEGER,
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


INSERT INTO show(title, author, dateBegin, dateEnd) VALUES("Skin dog's songs", "Haski", "16.12.2020", "18.12.2020");
INSERT INTO show(title, author, dateBegin, dateEnd) VALUES("HASHEstvie", "Russkoe Radio", "08.08.2021", "15.08.2021");
INSERT INTO show(title, author, dateBegin, dateEnd) VALUES("Spartak", "Aram Hachaturyan", "17.01.2021", "21.12.2021");
INSERT INTO show(title, author, dateBegin, dateEnd) VALUES("Noch' Kino", "a lot", "22.09.2020", "23.09.2020");


INSERT INTO tickets(theatreId, showId, totalCount, currentCount, price, className) VALUES(1, 1, 200, 200, 600, "dancefloor");
INSERT INTO tickets(theatreId, showId, totalCount, currentCount, price, className) VALUES(1, 1, 100, 100, 1200, "VIP-coach");
INSERT INTO tickets(theatreId, showId, totalCount, currentCount, price, className) VALUES(4, 1, 100, 100, 350, "dancefloor");
INSERT INTO tickets(theatreId, showId, totalCount, currentCount, price, className) VALUES(4, 1, 50, 50, 600, "VIP-coach");
INSERT INTO tickets(theatreId, showId, totalCount, currentCount, price, className) VALUES(4, 1, 50, 50, 1200, "VIP-coach+Bar");

INSERT INTO tickets(theatreId, showId, totalCount, currentCount, price, className) VALUES(2, 2, 150, 150, 450, "dancefloor");
INSERT INTO tickets(theatreId, showId, totalCount, currentCount, price, className) VALUES(2, 2, 75, 75, 700, "VIP");
INSERT INTO tickets(theatreId, showId, totalCount, currentCount, price, className) VALUES(1, 2, 100, 100, 350, "dancefloor");
INSERT INTO tickets(theatreId, showId, totalCount, currentCount, price, className) VALUES(1, 2, 50, 50, 450, "VIP");
INSERT INTO tickets(theatreId, showId, totalCount, currentCount, price, className) VALUES(1, 2, 50, 50, 550, "VIP+authograph");

INSERT INTO tickets(theatreId, showId, totalCount, currentCount, price, className) VALUES(3, 3, 150, 150, 1000, "1st+2nd row");
INSERT INTO tickets(theatreId, showId, totalCount, currentCount, price, className) VALUES(3, 3, 600, 600, 850, "3d and more row");
INSERT INTO tickets(theatreId, showId, totalCount, currentCount, price, className) VALUES(2, 3, 25, 25, 600, "1st row");
INSERT INTO tickets(theatreId, showId, totalCount, currentCount, price, className) VALUES(2, 3, 50, 50, 500, "2-3 rows");
INSERT INTO tickets(theatreId, showId, totalCount, currentCount, price, className) VALUES(2, 3, 100, 100, 350, "4-7 rows");

INSERT INTO tickets(theatreId, showId, totalCount, currentCount, price, className) VALUES(4, 4, 200, 200, 600, "back rows");
INSERT INTO tickets(theatreId, showId, totalCount, currentCount, price, className) VALUES(4, 4, 200, 200, 800, "front rows");
INSERT INTO tickets(theatreId, showId, totalCount, currentCount, price, className) VALUES(3, 4, 100, 100, 350, "back rows");
INSERT INTO tickets(theatreId, showId, totalCount, currentCount, price, className) VALUES(3, 4, 50, 50, 600, "front rows");
INSERT INTO tickets(theatreId, showId, totalCount, currentCount, price, className) VALUES(3, 4, 50, 50, 1200, "VIP-coach");


INSERT INTO clients(name, surname) VALUES("Alex", "Sachuk");
INSERT INTO clients(name, surname) VALUES("Petr", "Strepetov");
INSERT INTO clients(name, surname) VALUES("Dima", "Potapov");
INSERT INTO clients(name, surname) VALUES("Ivan", "Zmanovski");
INSERT INTO clients(name, surname) VALUES("Vladimir", "Parusov");
INSERT INTO clients(name, surname) VALUES("Diana", "Kozhevnikova");
INSERT INTO clients(name, surname) VALUES("Ivan", "Popov");
INSERT INTO clients(name, surname) VALUES("Sasha", "Milanich");
INSERT INTO clients(name, surname) VALUES("Valeriy", "Zhmishenko");