import React, { useState } from "react";
import { Navbar, Nav, Button, Container, Dropdown } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";
import { isAuthenticated, logout, getUserInfo, isAdmin } from "./auth";
import axios from "../instances/axiosInstance";

const Base = () => {
    const navigate = useNavigate();
    const user = getUserInfo();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = (e) => {
        e.preventDefault();
        logout();
        navigate("/");
    };

    const handleDelete = () => {
        if (window.confirm("Вы уверены, что хотите удалить ваш аккаунт?")) {
            axios.delete(`/users/${user.id}`)
                .then(() => {
                    logout();
                    navigate("/register", { replace: true });
                })
                .catch(error => console.error("Ошибка удаления:", error));
        }
    };

    return (
        <>
            <Navbar bg="primary" variant="dark" expand="lg">
                <Container>
                    <Navbar.Brand onClick={() => navigate("/")}>
                        <img
                            alt=""
                            src="/logo.svg"
                            width="30"
                            height="30"
                            className="d-inline-block align-top"
                        />
                        {' '}
                        HSE Chess Results
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="navbar-nav" />
                    <Navbar.Collapse id="navbar-nav" className="justify-content-end">
                        {isAuthenticated() ? (
                            <Dropdown show={showDropdown} onToggle={() => setShowDropdown(!showDropdown)}>
                                <Dropdown.Toggle variant="primary" className="text-light border-0">
                                    {user ? user.fio : "Загрузка..."}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {!isAdmin() && (
                                        <>
                                            <Dropdown.Item onClick={() => navigate("/edit")}>Изменить</Dropdown.Item>
                                            <Dropdown.Item onClick={handleDelete}>Удалить</Dropdown.Item>
                                        </>
                                    )}
                                    <Dropdown.Item onClick={handleLogout} className="text-warning">Выйти</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        ) : (
                            <Nav>
                                <Button variant="outline-warning" onClick={() => navigate("/register")} className="me-2">
                                    Зарегистрироваться
                                </Button>
                                <Button variant="outline-light" onClick={() => navigate("/login")}>
                                    Войти
                                </Button>
                            </Nav>
                        )}
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container className="mt-4">
                <Outlet />
            </Container>
        </>
    );
};

export default Base;
