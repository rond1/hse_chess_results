import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Button, Alert, Container } from "react-bootstrap";
import axios from "axios";
import { getUserInfo } from "./auth";

const TournamentForm = () => {
    const salt = process.env.REACT_APP_SALT;
    const user = getUserInfo();
    const navigate = useNavigate();
    const { tournamentId } = useParams();
    const [formData, setFormData] = useState({
        name: "",
        game_time: 30,
        move_time: 30,
        start: "",
        creator_id: user.id,
        salt: salt
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (tournamentId) {
            axios.get(`http://127.0.0.1:5000/api/tournaments/${tournamentId}`)
                .then(response => {
                    setFormData(response.data);
                })
                .catch(error => {
                    console.error("Ошибка загрузки данных турнира:", error);
                    setMessage("Не удалось загрузить данные турнира.");
                });
        }
    }, [tournamentId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setMessage(null);

        try {
            console.log(formData);
            const url = tournamentId
                ? `http://127.0.0.1:5000/api/tournaments/${tournamentId}`
                : "http://127.0.0.1:5000/api/tournaments";
            const method = tournamentId ? "PUT" : "POST";
            console.log(url, method, formData);

            const response = await axios({
                method: method,
                url: url,
                data: {
                    ...formData,
                    salt: salt,
                    creator_id: user.id
                },
                headers: { "Content-Type": "application/json" },
                withCredentials: true
            });

            if (response.data.errors) {
                setErrors(response.data.errors);
            } else {
                setMessage(tournamentId ? "Турнир обновлён!" : "Турнир создан!");
                setTimeout(() => navigate("/tournaments"), 1000);
            }
        } catch (error) {
            console.error(error);
            setErrors(error.response?.data?.errors || { general: "Ошибка сохранения данных" });
        }
    };

    return (
        <Container className="mt-4">
            <h1>{tournamentId ? "Редактирование турнира" : "Создание турнира"}</h1>
            {message && <Alert variant="success">{message}</Alert>}
            {errors.general && <Alert variant="danger">{errors.general}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formName">
                    <Form.Label>Название турнира</Form.Label>
                    <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={errors.name ? "is-invalid" : ""}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </Form.Group>

                <Form.Group controlId="formGameTime" className="mt-3">
                    <Form.Label>Количество минут</Form.Label>
                    <Form.Control
                        type="number"
                        name="game_time"
                        min="0"
                        max="90"
                        step="1"
                        value={formData.game_time}
                        onChange={handleChange}
                        className={errors.game_time ? "is-invalid" : ""}
                    />
                    {errors.game_time && <div className="invalid-feedback">{errors.game_time}</div>}
                </Form.Group>

                <Form.Group controlId="formMoveTime" className="mt-3">
                    <Form.Label>Количество секунд на ход</Form.Label>
                    <Form.Control
                        type="number"
                        name="move_time"
                        min="0"
                        max="1800"
                        step="1"
                        value={formData.move_time}
                        onChange={handleChange}
                        className={errors.move_time ? "is-invalid" : ""}
                    />
                    {errors.move_time && <div className="invalid-feedback">{errors.move_time}</div>}
                </Form.Group>

                <Form.Group controlId="formStart" className="mt-3">
                    <Form.Label>Дата начала</Form.Label>
                    <Form.Control
                        type="datetime-local"
                        name="start"
                        value={formData.start}
                        onChange={handleChange}
                        className={errors.start ? "is-invalid" : ""}
                    />
                    {errors.start && <div className="invalid-feedback">{errors.start}</div>}
                </Form.Group>

                <Button variant="dark" type="submit" className="mt-3">
                    {tournamentId ? "Сохранить изменения" : "Создать турнир"}
                </Button>
            </Form>
        </Container>
    );
};

export default TournamentForm;
