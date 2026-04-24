import { Outlet } from "react-router-dom";
import { Navbar } from "../common/Navbar";
import "./MainLayout.css";

const MainLayout = () => {
  return (
    <div className="main-layout">
      <Navbar />
      <main className="main-content-area">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
