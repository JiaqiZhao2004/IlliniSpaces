-- Enable local infile if needed
SET GLOBAL local_infile = 1;
USE databased;


-- Load Buildings
LOAD DATA LOCAL INFILE './mock_data/Buildings_mock_data.csv'
INTO TABLE Buildings
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(BuildingId, BuildingName, Longitude, Latitude);

-- Load Rooms
LOAD DATA LOCAL INFILE './mock_data/Rooms_mock_data.csv'
INTO TABLE Rooms
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(RoomNumber, BuildingId, Capacity, Type);

-- Load Users
LOAD DATA LOCAL INFILE './mock_data/Users_mock_data.csv'
INTO TABLE Users
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(UID, Email, FullName);

-- Load Favorites
LOAD DATA LOCAL INFILE './mock_data/Favorites_mock_data.csv'
INTO TABLE Favorites
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(UID, BuildingId);

-- Load UserReservations
LOAD DATA LOCAL INFILE './mock_data/UserReservations_mock_data.csv'
INTO TABLE UserReservations
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(ReservationId, Date, StartTime, EndTime, UID, RoomNumber, BuildingId);

-- Load HardReservations
LOAD DATA LOCAL INFILE './mock_data/HardReservations_mock_data.csv'
INTO TABLE HardReservations
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(EventId, StartDate, EndDate, Repeats, StartTime, EndTime, EventName, RoomNumber, BuildingId);
