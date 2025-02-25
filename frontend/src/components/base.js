import React from "react";
import { Navbar, Nav, Button, Container } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";
import { isAuthenticated, logout, getUserInfo } from "./auth";

const Base = () => {
    const navigate = useNavigate();
    const user = getUserInfo();

    const handleLogout = (e) => {
        e.preventDefault();
        logout();
        navigate("/login");
    };

    return (
        <>
            <Navbar bg="dark" variant="dark" expand="lg">
                <Container>
                    <Navbar.Brand href="/">HSE Chess Results</Navbar.Brand>
                    <Navbar.Toggle aria-controls="navbar-nav" />
                    <Navbar.Collapse id="navbar-nav" className="justify-content-end">
                        {isAuthenticated() ? (
                            <Navbar.Text className="text-light">
                                {user ? `${user.fio}` : "Загрузка..."} |{" "}
                                <a href="/" onClick={handleLogout} className="text-light">
                                    Выйти
                                </a>
                            </Navbar.Text>
                        ) : (
                            <Nav>
                                <Button variant="outline-primary" href="/register" className="me-2">
                                    Зарегистрироваться
                                </Button>
                                <Button variant="outline-light" href="/login">
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
