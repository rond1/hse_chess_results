import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Alert, Container } from "react-bootstrap";
import {useHelmetTitle} from "../hooks/indexHooks";

const FACULTIES = [
    ["cs", "Факультет компьютерных наук"],
    ["math", "Факультет математики"],
    ["soc", "Факультет социальных наук"],
    ["wep", "Факультет мировой экономики и мировой политики"],
    ["ci", "Факультет креативных индустрий"],
    ["geo", "Факультет географии и геоинформационных технологий"],
    ["hum", "Факультет гуманитарных наук"],
    ["law", "Факультет права"],
    ["bm", "Факультет бизнеса и менеджмента"],
    ["cmd", "Факультет коммуникаций, медиа и дизайна"],
    ["edu", "Институт образования"],
    ["trans", "Институт экономики транспорта и транспортной политики"],
    ["stat", "Институт статистических исследований и экономики знаний"],
    ["demo", "Институт демографии"],
    ["law_dev", "Институт права и развития"],
    ["miem", "Московский институт электроники и математики (МИЭМ)"]
];

const DEGREES = [
    ["1", "1 курс бакалавриата"],
    ["2", "2 курс бакалавриата"],
    ["3", "3 курс бакалавриата"],
    ["4", "4 курс бакалавриата"],
    ["5", "1 курс специалитета"],
    ["6", "2 курс специалитета"],
    ["7", "3 курс специалитета"],
    ["8", "4 курс специалитета"],
    ["9", "5 курс специалитета"],
    ["10", "1 курс магистратуры"],
    ["11", "2 курс магистратуры"],
    ["12", "1 курс аспирантуры"],
    ["13", "2 курс аспирантуры"],
    ["14", "3 курс аспирантуры"],
    ["15", "Выпускник"],
];

const Register = () => {
    useHelmetTitle("Регистрация");
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        password_again: "",
        fio: "",
        gender: "М",
        faculty: "cs",
        degree: "1",
    });

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setMessage(null);

        console.log("Отправляемые данные:", formData);

        try {
            const response = await fetch("http://127.0.0.1:5000/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            console.log("Ответ сервера:", data);
            if (response.ok) {
                setMessage(data.message);
                setTimeout(() => navigate("/login"), 500);
            } else {
                setErrors(data.errors || { general: data.error });
            }
        } catch (error) {
            setErrors({ general: "Ошибка соединения с сервером" });
        }
    };

    return (
        <Container className="mt-4">
            <h1>Регистрация</h1>
            {message && <Alert variant="success">{message}</Alert>}
            {errors.general && <Alert variant="danger">{errors.general}</Alert>}

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

                <Form.Group controlId="formPasswordAgain" className="mt-3">
                    <Form.Label>Повторите пароль</Form.Label>
                    <Form.Control
                        type="password"
                        name="password_again"
                        value={formData.password_again}
                        onChange={handleChange}
                        className={errors.password_again ? "is-invalid" : ""}
                    />
                    {errors.password_again && <div className="invalid-feedback">{errors.password_again}</div>}
                </Form.Group>

                <Form.Group controlId="formFio" className="mt-3">
                    <Form.Label>ФИО</Form.Label>
                    <Form.Control
                        type="text"
                        name="fio"
                        value={formData.fio}
                        onChange={handleChange}
                        className={errors.fio ? "is-invalid" : ""}
                    />
                    {errors.fio && <div className="invalid-feedback">{errors.fio}</div>}
                </Form.Group>

                <Form.Group controlId="formGender" className="mt-3">
                    <Form.Label>Пол</Form.Label>
                    <Form.Select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className={errors.gender ? "is-invalid" : ""}
                    >
                        <option value="М">Мужской</option>
                        <option value="Ж">Женский</option>
                    </Form.Select>
                    {errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
                </Form.Group>

                <Form.Group controlId="formFaculty" className="mt-3">
                    <Form.Label>Факультет</Form.Label>
                    <Form.Select
                        name="faculty"
                        value={formData.faculty}
                        onChange={handleChange}
                        className={errors.faculty ? "is-invalid" : ""}
                    >
                        {FACULTIES.map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </Form.Select>
                    {errors.faculty && <div className="invalid-feedback">{errors.faculty}</div>}
                </Form.Group>

                <Form.Group controlId="formDegree" className="mt-3">
                    <Form.Label>Ступень образования</Form.Label>
                    <Form.Select
                        name="degree"
                        value={formData.degree}
                        onChange={handleChange}
                        className={errors.degree ? "is-invalid" : ""}
                    >
                        {DEGREES.map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </Form.Select>
                    {errors.degree && <div className="invalid-feedback">{errors.degree}</div>}
                </Form.Group>

                <Button variant="primary" type="submit" className="mt-3">
                    Зарегистрироваться
                </Button>
            </Form>
        </Container>
    );
};

export default Register;
