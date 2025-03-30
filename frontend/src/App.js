import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./components/register";
import Login from "./components/login";
import Base from "./components/base";
import Home from "./components/home";
import UserList from "./components/users";
import User from "./components/user";
import EditProfile from "./components/edit_user";
import TournamentList from "./components/tournaments";
import TournamentForm from "./components/add_edit_tournament";

function App() {
  return (
      <BrowserRouter>
          <Routes>
              <Route path="register" element={<Register />} />
              <Route path="login" element={<Login />} />
              <Route path="edit" element={<EditProfile />} />
              <Route path="/tournament/edit" element={<TournamentForm />} />

              <Route element={<Base />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/users" element={<UserList />} />
                  <Route path="/users/:id" element={<User />} />
                  <Route path="/tournaments" element={<TournamentList />} />
              </Route>
          </Routes>
      </BrowserRouter>
  );
}

export default App;