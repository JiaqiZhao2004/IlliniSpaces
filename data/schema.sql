create table databased.Buildings
(
    BuildingId   varchar(7)     not null
        primary key,
    BuildingName varchar(75)    not null,
    Longitude    decimal(11, 8) null,
    Latitude     decimal(10, 8) null
);

create table databased.Rooms
(
    RoomNumber varchar(10) not null,
    BuildingId varchar(7)  not null,
    Capacity   int         null,
    Type       varchar(50) null,
    primary key (RoomNumber, BuildingId),
    constraint Rooms_ibfk_1
        foreign key (BuildingId) references databased.Buildings (BuildingId)
            on update cascade on delete cascade
);

create table databased.HardReservations
(
    EventId    int auto_increment
        primary key,
    StartDate  varchar(10)  not null,
    EndDate    varchar(10)  not null,
    Repeats    varchar(10)  null,
    StartTime  varchar(10)  not null,
    EndTime    varchar(10)  not null,
    EventName  varchar(150) not null,
    RoomNumber varchar(10)  not null,
    BuildingId varchar(7)   not null,
    constraint HardReservations_ibfk_1
        foreign key (RoomNumber, BuildingId) references databased.Rooms (RoomNumber, BuildingId)
            on update cascade on delete cascade
);

create index idx_hardreservations_time
    on databased.HardReservations (RoomNumber, BuildingId, StartTime, EndTime);

create definer = root@`%` trigger databased.insert_room_if_missing
    before insert
    on databased.HardReservations
    for each row
begin
    IF NOT EXISTS (
    SELECT 1 FROM Rooms
    WHERE RoomNumber = NEW.RoomNumber AND BuildingId = NEW.BuildingId
  ) THEN
    INSERT INTO Rooms (RoomNumber, BuildingId)
    VALUES (NEW.RoomNumber, NEW.BuildingId);
  END IF;
end;

create index idx_rooms_buid_rnb
    on databased.Rooms (BuildingId, RoomNumber);

create index idx_rooms_capacity
    on databased.Rooms (Capacity);

create table databased.Users
(
    UID      int auto_increment
        primary key,
    Email    varchar(50) not null,
    FullName varchar(50) not null,
    constraint Email
        unique (Email)
);

create table databased.Favorites
(
    UID        int        not null,
    BuildingId varchar(7) not null,
    primary key (UID, BuildingId),
    constraint Favorites_ibfk_1
        foreign key (UID) references databased.Users (UID)
            on update cascade on delete cascade,
    constraint Favorites_ibfk_2
        foreign key (BuildingId) references databased.Buildings (BuildingId)
            on update cascade on delete cascade
);

create table databased.UserReservations
(
    ReservationId int auto_increment
        primary key,
    Date          varchar(10) not null,
    StartTime     varchar(10) not null,
    EndTime       varchar(10) not null,
    UID           int         not null,
    RoomNumber    varchar(10) not null,
    BuildingId    varchar(7)  not null,
    constraint UserReservations_ibfk_1
        foreign key (UID) references databased.Users (UID)
            on update cascade on delete cascade,
    constraint UserReservations_ibfk_2
        foreign key (RoomNumber, BuildingId) references databased.Rooms (RoomNumber, BuildingId)
            on update cascade on delete cascade
);

create index idx_ur_buid_resid
    on databased.UserReservations (BuildingId, ReservationId);

create index idx_ur_building
    on databased.UserReservations (BuildingId);

create index idx_ur_roomonly
    on databased.UserReservations (RoomNumber);

create index idx_ur_uid_resid
    on databased.UserReservations (UID, ReservationId);


create
    definer = root@`%` procedure databased.GetNearestAvailableBuildings(IN userLat decimal(10, 8),
                                                                        IN userLong decimal(11, 8),
                                                                        IN currentDate varchar(10),
                                                                        IN currentTime varchar(10), IN maxResults int)
BEGIN
    IF userLat < -90 OR userLat > 90 THEN
        SELECT 'Invalid latitude: must be between -90 and 90' AS ErrorMessage;
    ELSEIF userLong < -180 OR userLong > 180 THEN
        SELECT 'Invalid longitude: must be between -180 and 180' AS ErrorMessage;
    ELSEIF maxResults <= 0 THEN
        SELECT 'Invalid maxResults: must be greater than 0' AS ErrorMessage;
    ELSE
        SELECT
            BuildingId,
            BuildingName,
            Latitude,
            Longitude,
            6371 * 2 * ASIN(SQRT(
                POWER(SIN(RADIANS((Latitude - userLat) / 2)), 2) +
                COS(RADIANS(userLat)) * COS(RADIANS(Latitude)) *
                POWER(SIN(RADIANS((Longitude - userLong) / 2)), 2)
            )) AS DistanceKm,
            COUNT(DISTINCT RoomNumber) AS FreeRoomCount
        FROM (
            SELECT
                r.RoomNumber,
                r.BuildingId,
                b.BuildingName,
                b.Latitude,
                b.Longitude
            FROM Rooms r
            JOIN Buildings b ON r.BuildingId = b.BuildingId
            WHERE b.Latitude IS NOT NULL AND b.Longitude IS NOT NULL
              AND NOT EXISTS (
                  SELECT 1
                  FROM UserReservations ur
                  WHERE ur.BuildingId = r.BuildingId
                    AND ur.RoomNumber = r.RoomNumber
                    AND STR_TO_DATE(ur.Date, '%Y-%m-%d') = STR_TO_DATE(currentDate, '%Y-%m-%d')
                    AND STR_TO_DATE(currentTime, '%H:%i') BETWEEN STR_TO_DATE(ur.StartTime, '%H:%i') AND STR_TO_DATE(ur.EndTime, '%H:%i')
              )
              AND NOT EXISTS (
                  SELECT 1
                  FROM HardReservations hr
                  WHERE hr.BuildingId = r.BuildingId
                    AND hr.RoomNumber = r.RoomNumber
                    AND STR_TO_DATE(currentDate, '%Y-%m-%d') BETWEEN STR_TO_DATE(hr.StartDate, '%Y-%m-%d') AND STR_TO_DATE(hr.EndDate, '%Y-%m-%d')
                    AND STR_TO_DATE(currentTime, '%H:%i') BETWEEN STR_TO_DATE(hr.StartTime, '%H:%i') AND STR_TO_DATE(hr.EndTime, '%H:%i')
              )
        ) AS AvailableRooms
        GROUP BY BuildingId, BuildingName, Latitude, Longitude
        HAVING FreeRoomCount > 0
        ORDER BY DistanceKm ASC
        LIMIT maxResults;
    END IF;
END;

create
    definer = root@`%` procedure databased.GetRoomsWithMetadata(IN currentDate varchar(10), IN currentTime varchar(10))
BEGIN
    SELECT
        r.RoomNumber,
        r.BuildingId,
        r.Capacity,
        r.Type,
        b.BuildingName,
        (
            NOT EXISTS (
                SELECT 1
                FROM UserReservations ur
                WHERE ur.BuildingId = r.BuildingId
                  AND ur.RoomNumber = r.RoomNumber
                  AND STR_TO_DATE(ur.Date, '%Y-%m-%d') = STR_TO_DATE(currentDate, '%Y-%m-%d')
                  AND STR_TO_DATE(currentTime, '%H:%i') BETWEEN STR_TO_DATE(ur.StartTime, '%H:%i') AND STR_TO_DATE(ur.EndTime, '%H:%i')
            )
            AND NOT EXISTS (
                SELECT 1
                FROM HardReservations hr
                WHERE hr.BuildingId = r.BuildingId
                  AND hr.RoomNumber = r.RoomNumber
                  AND STR_TO_DATE(currentDate, '%Y-%m-%d') BETWEEN STR_TO_DATE(hr.StartDate, '%Y-%m-%d') AND STR_TO_DATE(hr.EndDate, '%Y-%m-%d')
                  AND STR_TO_DATE(currentTime, '%H:%i') BETWEEN STR_TO_DATE(hr.StartTime, '%H:%i') AND STR_TO_DATE(hr.EndTime, '%H:%i')
            )
        ) AS `Available`
    FROM Rooms r
    JOIN Buildings b ON r.BuildingId = b.BuildingId
    WHERE b.Latitude IS NOT NULL AND b.Longitude IS NOT NULL;
END;

