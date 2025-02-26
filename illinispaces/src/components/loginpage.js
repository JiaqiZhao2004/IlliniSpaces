const LoginPage = () => {
    return (
      <div className="flex h-screen">
        {/* Left Side (Welcome Section) */}
        <div className="w-1/2 bg-[#112F57] text-white p-10 flex flex-col justify-center">
          <h2 className="text-4xl font-bold">Welcome to IlliniSpaces</h2>
          <p className="mt-4 text-lg">
            Your gateway to the University of Illinois community. Sign in to access exclusive 
            resources and connect with fellow Illini.
          </p>
        </div>
  
        {/* Right Side (Login Section) */}
        <div className="w-1/2 bg-white flex flex-col justify-center p-10">
          <h2 className="text-2xl font-bold text-[#112F57]">Sign in to your account</h2>
          <label className="block text-gray-700 mt-4 text-sm font-medium">Email address</label>
          <input
            type="email"
            placeholder="Enter your @illinois.edu email"
            className="mt-2 p-3 border rounded-md w-full"
          />
          <button className="mt-4 bg-[#E04124] text-white py-3 rounded-md text-lg font-bold w-full">
            Sign in
          </button>
        </div>
      </div>
    );
  };
  
  export default LoginPage;
  