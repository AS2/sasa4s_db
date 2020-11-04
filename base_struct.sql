CREATE TABLE theaters (
    TheaterID INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    address TEXT
);

CREATE TABLE show (
    ShowID INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    author TEXT
);

CREATE TABLE showProgramm (
    ShowProgrammID INTEGER PRIMARY KEY AUTOINCREMENT,
    tId INTEGER,
    sId INTEGER,
    showDate TEXT
);

CREATE TABLE tickets (
    TicketID INTEGER PRIMARY KEY AUTOINCREMENT,
    showProgrammId INTEGER,
    totalCount INTEGER,
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