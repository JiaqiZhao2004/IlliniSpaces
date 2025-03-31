CREATE TABLE Buildings (
    BuildingId VARCHAR(7) PRIMARY KEY,
    BuildingName VARCHAR(75) NOT NULL,
    Longitude DECIMAL(11, 8) NOT NULL,
    Latitude DECIMAL(10, 8) NOT NULL,
    UNIQUE(Longitude, Latitude) -- Enforces uniqueness for locations
);

CREATE TABLE Rooms (
    RoomNumber VARCHAR(10) NOT NULL,
    BuildingId VARCHAR(7) NOT NULL,
    Capacity INT,
    PRIMARY KEY (RoomNumber, BuildingId),
    FOREIGN KEY (BuildingId) REFERENCES Buildings(BuildingId) ON DELETE CASCADE
);

CREATE TABLE Users (
    UID INT PRIMARY KEY AUTO_INCREMENT,
    Email VARCHAR(50) NOT NULL UNIQUE, -- Email is unique per functional dependency
    FullName VARCHAR(50) NOT NULL
);

CREATE TABLE Favorites (
    UID INT NOT NULL,
    BuildingId VARCHAR(7) NOT NULL,
    PRIMARY KEY (UID, BuildingId),
    FOREIGN KEY (UID) REFERENCES Users(UID) ON DELETE CASCADE,
    FOREIGN KEY (BuildingId) REFERENCES Buildings(BuildingId) ON DELETE CASCADE
);

CREATE TABLE UserReservations (
    ReservationId INT PRIMARY KEY AUTO_INCREMENT,
    Date VARCHAR(10) NOT NULL,
    StartTime VARCHAR(10) NOT NULL,
    EndTime VARCHAR(10) NOT NULL,
    UID INT NOT NULL,
    RoomNumber VARCHAR(10) NOT NULL,
    BuildingId VARCHAR(7) NOT NULL,
    FOREIGN KEY (UID) REFERENCES Users(UID) ON DELETE CASCADE,
    FOREIGN KEY (RoomNumber, BuildingId) REFERENCES Rooms(RoomNumber, BuildingId) ON DELETE CASCADE
);

CREATE TABLE HardReservations (
    EventId INT PRIMARY KEY AUTO_INCREMENT,
    StartDate VARCHAR(10) NOT NULL,
    EndDate VARCHAR(10) NOT NULL,
    Repeats VARCHAR(10), -- Nullable since Repeats is optional
    StartTime VARCHAR(10) NOT NULL,
    EndTime VARCHAR(10) NOT NULL,
    EventName VARCHAR(100) NOT NULL,
    RoomNumber VARCHAR(10) NOT NULL,
    BuildingId VARCHAR(7) NOT NULL,
    FOREIGN KEY (RoomNumber, BuildingId) REFERENCES Rooms(RoomNumber, BuildingId) ON DELETE CASCADE
);