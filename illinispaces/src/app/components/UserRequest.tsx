interface UserRequestProps {
  RoomNumber: string;
  BuildingName: string;
  Date: string;
  StartTime: string;
  EndTime: string;
}

export const UserRequest: React.FC<UserRequestProps> = ({
  RoomNumber,
  BuildingName,
  Date,
  StartTime,
  EndTime
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-700">{BuildingName}</h3>
          <p className="text-gray-600">Room {RoomNumber}</p>
          <div className="mt-2 text-sm text-gray-500">
            <p>Date: {Date}</p>
            <p>From: {StartTime}</p>
            <p>To: {EndTime}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
