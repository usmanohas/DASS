import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const RequireAuth = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // capture where the user wants to go

  useEffect(() => {
    axios.defaults.withCredentials = true;
    axios
      .get("http://localhost:3000/verify")
      .then((res) => {
        if (res.data.Status) {
          const { role, id } = res.data;

          if (role === "ADMIN" && location.pathname.startsWith("/admin")) {
            setAuthorized(true); // allow route
          } else if (role === "FOCAL_PERSON" && location.pathname.startsWith("/department")) {
            setAuthorized(true); // allow route
          } else if (role === "STAFF" && location.pathname.startsWith("/staff")) {
            setAuthorized(true); // allow route
          }else if (role === "SUPER_ADMIN" && location.pathname.startsWith("/superadmin")) {
            setAuthorized(true); // allow route
          }else if (role === "PARTNER" && location.pathname.startsWith("/partner")) {
            setAuthorized(true); // allow route
          }else {
            // Authenticated but wrong role for this route
            if (role === "ADMIN") {
              navigate(`/admin`);
            } else if (role === "FOCAL_PERSON") {
              navigate(`/department`);
            } else if (role === "SUPER_ADMIN") {
              navigate(`/superadmin`);
            }else if (role === "STAFF") {
              navigate(`/staff`);
            } else {
              navigate("/partner");
            }
          }
        } else {
          // Not authenticated
          navigate("/");
        }
      })
      .catch((err) => {
        console.error(err);
        navigate("/");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate, location.pathname]);

  if (loading) return <div>Loading...</div>;

  return authorized ? children : null;
};

export default RequireAuth;
