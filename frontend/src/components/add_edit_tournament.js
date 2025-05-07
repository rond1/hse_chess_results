import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Button, Alert, Container, Spinner } from "react-bootstrap";
import axios from "../instances/axiosInstance";
import { getUserInfo } from "./auth";
import { useHelmetTitle } from "../hooks/indexHooks";

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
    const [saving, setSaving] = useState(false);

    useHelmetTitle(tournamentId ? "Редактирование турнира" : "Создание турнира");

    useEffect(() => {
        if (tournamentId) {
            axios.get(`/tournaments/${tournamentId}`)
                .then(response => {
                    setFormData({
                        ...response.data,
                        start: response.data.start.slice(0, 16)
                    });
                })
                .catch(error => {
                    console.error("Ошибка загрузки турнира:", error);
                    setMessage("Не удалось загрузить данные турнира.");
                });
        }
    }, [tournamentId]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setErrors({});
        setMessage(null);
        setSaving(true);

        try {
            const url = tournamentId
                ? `/tournaments/${tournamentId}`
                : "/tournaments";

            const method = tournamentId ? "put" : "post";

            const response = await axios({
                method,
                url,
                data: {
                    ...formData,
                    creator_id: user.id,
                    salt: salt,
                }
            });

            if (response.data.errors) {
                setErrors(response.data.errors);
            } else {
                setMessage(tournamentId ? "Турнир обновлён!" : "Турнир создан!");
                if (!tournamentId) {
                    setFormData({
                        name: "",
                        game_time: 30,
                        move_time: 30,
                        start: "",
                        creator_id: user.id,
                        salt: salt
                    });
                }
                setTimeout(() => navigate("/tournaments"), 1000);
            }
        } catch (error) {
            console.error("Ошибка при сохранении:", error);
            setErrors(error.response?.data?.errors || { general: "Ошибка сохранения данных" });
        } finally {
            setSaving(false);
        }
    }, [formData, navigate, salt, tournamentId, user.id]);

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

                <Button
                    variant="primary"
                    type="submit"
                    className="mt-3"
                    disabled={saving}
                >
                    {saving ? <Spinner animation="border" size="sm" /> : tournamentId ? "Сохранить изменения" : "Создать турнир"}
                </Button>
            </Form>
        </Container>
    );
};

export default TournamentForm;
