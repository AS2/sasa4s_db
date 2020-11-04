INSERT INTO theaters(name, address) VALUES("The Big Theater", "Moscow");
INSERT INTO theaters(name, address) VALUES("TUZ", "SPb");
INSERT INTO theaters(name, address) VALUES("Mariinsky Theatre", "SPb");
INSERT INTO theaters(name, address) VALUES("MOD Club", "SPb");

INSERT INTO show(title, author) VALUES("Muzlo", "Haski");
INSERT INTO show(title, author) VALUES("HASHEstvie", "Russkoe Radio");
INSERT INTO show(title, author) VALUES("Spartak", "Aram Hachaturyan");
INSERT INTO show(title, author) VALUES("Noch Kino", "a lot");

INSERT INTO showProgramm(tId, sId, showDate) VALUES(1, 1, "2020-11-07-17-30");
INSERT INTO showProgramm(tId, sId, showDate) VALUES(4, 1, "2020-11-07-17-30");
INSERT INTO showProgramm(tId, sId, showDate) VALUES(2, 2, "2020-11-04-00-00");
INSERT INTO showProgramm(tId, sId, showDate) VALUES(1, 2, "2020-11-11-00-00");
INSERT INTO showProgramm(tId, sId, showDate) VALUES(3, 3, "2019-02-01-12-00");
INSERT INTO showProgramm(tId, sId, showDate) VALUES(2, 3, "2019-02-01-12-00");
INSERT INTO showProgramm(tId, sId, showDate) VALUES(2, 3, "2020-11-05-12-00");
INSERT INTO showProgramm(tId, sId, showDate) VALUES(4, 4, "2019-02-01-12-00");
INSERT INTO showProgramm(tId, sId, showDate) VALUES(3, 4, "2019-02-01-12-00");
INSERT INTO showProgramm(tId, sId, showDate) VALUES(1, 1, "2020-11-07-10-00");
INSERT INTO showProgramm(tId, sId, showDate) VALUES(4, 1, "2020-11-07-10-00");
INSERT INTO showProgramm(tId, sId, showDate) VALUES(2, 2, "2020-11-11-12-00");
INSERT INTO showProgramm(tId, sId, showDate) VALUES(1, 2, "2020-11-11-12-00");
INSERT INTO showProgramm(tId, sId, showDate) VALUES(3, 3, "2021-02-01-12-00");
INSERT INTO showProgramm(tId, sId, showDate) VALUES(2, 3, "2021-02-01-12-00");
INSERT INTO showProgramm(tId, sId, showDate) VALUES(4, 4, "2019-12-01-12-00");
INSERT INTO showProgramm(tId, sId, showDate) VALUES(3, 4, "2019-12-01-12-00");

INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(1, 200, 600, "dancefloor");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(1, 100, 1200, "VIP-coach");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(2, 100, 350, "dancefloor");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(2, 50, 600, "VIP-coach");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(2, 50, 1200, "VIP-coach+Bar");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(3, 150, 450, "dancefloor");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(3, 75, 700, "VIP");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(4, 100, 350, "dancefloor");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(4, 50, 450, "VIP");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(4, 50, 550, "VIP+authograph");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(5, 150, 1000, "1st+2nd row");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(5, 600, 850, "3d and more row");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(6, 25, 600, "1st row");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(6, 50, 500, "2-3 rows");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(6, 100, 350, "4-7 rows");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(7, 200, 600, "back rows");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(7, 200, 800, "front rows");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(8, 100, 350, "back rows");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(8, 50, 600, "front rows");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(8, 50, 1200, "VIP-coach");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(9, 200, 600, "dancefloor");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(9, 100, 1200, "VIP-coach");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(10, 100, 350, "dancefloor");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(10, 50, 600, "VIP-coach");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(10, 50, 1200, "VIP-coach+Bar");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(11, 150, 450, "dancefloor");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(11, 75, 700, "VIP");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(12, 100, 350, "dancefloor");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(12, 50, 450, "VIP");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(12, 50, 550, "VIP+authograph");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(13, 150, 1000, "1st+2nd row");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(13, 600, 850, "3d and more row");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(14, 25, 600, "1st row");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(14, 50, 500, "2-3 rows");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(14, 100, 350, "4-7 rows");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(15, 200, 600, "back rows");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(15, 200, 800, "front rows");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(16, 100, 350, "back rows");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(16, 50, 600, "front rows");
INSERT INTO tickets(showProgrammId, totalCount, price, className) VALUES(16, 50, 1200, "VIP-coach");

INSERT INTO clients(name, surname) VALUES("Alex", "Sachuk");
INSERT INTO clients(name, surname) VALUES("Petr", "Strepetov");
INSERT INTO clients(name, surname) VALUES("Dima", "Potapov");
INSERT INTO clients(name, surname) VALUES("Ivan", "Zmanovski");
INSERT INTO clients(name, surname) VALUES("Vladimir", "Parusov");
INSERT INTO clients(name, surname) VALUES("Diana", "Kozhevnikova");
INSERT INTO clients(name, surname) VALUES("Ivan", "Popov");
INSERT INTO clients(name, surname) VALUES("Sasha", "Milanich");
INSERT INTO clients(name, surname) VALUES("Valeriy", "Zhmishenko");