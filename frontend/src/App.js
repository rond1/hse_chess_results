import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./components/register";
import Login from "./components/login";
import Base from "./components/base";
import Home from "./components/home";
import UserList from "./components/users";

function App() {
  return (
      <BrowserRouter>
          <Routes>
              <Route path="register" element={<Register />} />
              <Route path="login" element={<Login />} />

              <Route element={<Base />}>
                  <Route path="/" element={<Home />}>
                      <Route path="/admin" element={<UserList />} />
                  </Route>
              </Route>
          </Routes>
      </BrowserRouter>
  );
}

export default App;