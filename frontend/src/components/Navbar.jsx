import {useAuth} from "../context/AuthContext";


function Navbar(){
    const {user,logout} = useAuth();


return (
      

<header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold">Dashboard</h1>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {user?.email}
        </span>
        <button
          onClick={logout}
          className="text-sm text-red-600 hover:underline"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;