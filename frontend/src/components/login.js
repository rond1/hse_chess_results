import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Alert, Container } from "react-bootstrap";

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "", rememberMe: false });
    const [errors, setErrors] = useState({email: "", password: ""});
    const [message, setMessage] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setMessage(null);

        try {
            const response = await fetch("http://127.0.0.1:5000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            console.log("Login response:", data);

            if (!response.ok) {
                setErrors(data.errors || { error: data.error });
                return;
            }

            localStorage.setItem("token", data.token);

            const userResponse = await fetch("http://127.0.0.1:5000/api/user", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${data.token}`,
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            const userData = await userResponse.json();
            console.log("User data:", userData);

            if (userResponse.ok) {
                localStorage.setItem("user", JSON.stringify({ fio: userData.fio, is_admin: userData.is_admin, id: userData.id }));
            } else {
                console.error("Ошибка загрузки пользователя:", userData.error);
            }

            setMessage("Вы успешно вошли!");
            setTimeout(() => navigate("/"), 1000);
        } catch (error) {
            console.error("Ошибка запроса:", error);
            setErrors({ error: "Ошибка соединения с сервером" });
        }
    };

    return (
        <Container className="mt-4">
            <h1>Авторизация</h1>
            {message && <Alert variant="success">{message}</Alert>}
            {errors.error && <Alert variant="danger">{errors.error}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? "is-invalid" : ""}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </Form.Group>

                <Form.Group controlId="formPassword" className="mt-3">
                    <Form.Label>Пароль</Form.Label>
                    <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={errors.password ? "is-invalid" : ""}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </Form.Group>

                <Form.Group controlId="formRememberMe" className="mt-3">
                    <Form.Check
                        type="checkbox"
                        label="Запомнить меня"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Button variant="dark" type="submit" className="mt-3">Войти</Button>
            </Form>
        </Container>
    );
}

export default Login;
