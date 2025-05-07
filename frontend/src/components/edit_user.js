import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Alert, Container } from "react-bootstrap";
import axios from "../instances/axiosInstance";
import { getUserInfo } from "./auth";
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
    ["15", "Выпускник"]
];

const EditProfile = () => {
    useHelmetTitle("Редактирование профиля");
    const navigate = useNavigate();
    const user = getUserInfo();
    const [formData, setFormData] = useState(null);
    const [message, setMessage] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        axios.get(`/users/${user.id}`)
            .then(response => {
                setFormData(response.data);
                console.log("Полученные данные:", response.data);
            })
            .catch(error => console.error("Ошибка загрузки данных пользователя:", error));
    }, [user.id]);

    if (!formData) {
        return <Container className="mt-4"><h1>Загрузка...</h1></Container>;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setMessage(null);

        try {
            const response = await axios.put(`/users/${user.id}`, formData);

            if (response.data.errors) {
                setErrors(response.data.errors);
            } else {
                setMessage("Данные успешно обновлены");
                setTimeout(() => navigate("/"), 500);
            }
        } catch (error) {
            setErrors(error.response?.data?.errors || { general: "Ошибка обновления данных" });
        }
    };

    return (
        <Container className="mt-4">
            <h1>Редактирование профиля</h1>
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
                    />
                </Form.Group>

                <Form.Group controlId="formFio" className="mt-3">
                    <Form.Label>ФИО</Form.Label>
                    <Form.Control
                        type="text"
                        name="fio"
                        value={formData.fio}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group controlId="formGender" className="mt-3">
                    <Form.Label>Пол</Form.Label>
                    <Form.Select name="is_female" value={formData.is_female ? "Ж" : "М"} onChange={handleChange}>
                        <option value="М">Мужской</option>
                        <option value="Ж">Женский</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group controlId="formFaculty" className="mt-3">
                    <Form.Label>Факультет</Form.Label>
                    <Form.Select name="faculty" key={formData.faculty} value={formData.faculty} onChange={handleChange}>
                        {FACULTIES.map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group controlId="formDegree" className="mt-3">
                    <Form.Label>Ступень образования</Form.Label>
                    <Form.Select name="degree" key={formData.degree} value={formData.degree} onChange={handleChange}>
                        {DEGREES.map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Button variant="primary" type="submit" className="mt-3">
                    Сохранить изменения
                </Button>
            </Form>
        </Container>
    );
};

export default EditProfile;