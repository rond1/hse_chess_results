import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, Button, Spinner, ListGroup, Row, Col, Alert } from "react-bootstrap";
import { getUserInfo, isAdmin, isAuthenticated } from "./auth";
import CategoryModal from "./add_edit_category";
import { useHelmetTitle } from "../hooks/indexHooks";
import axios from "../instances/axiosInstance";

const Tournament = () => {
    const salt = process.env.REACT_APP_SALT;
    const userInfo = getUserInfo();
    const creator_id = userInfo ? Number(userInfo.id) : null;
    const { tournamentId } = useParams();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loadingTournament, setLoadingTournament] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const fetchTournament = useCallback(async () => {
        try {
            const response = await axios.get(`/tournaments/${tournamentId}`);
            setTournament(response.data);
        } catch (error) {
            setError("Ошибка загрузки турнира");
        } finally {
            setLoadingTournament(false);
        }
    }, [tournamentId]);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await axios.get(`/categories`, {
                params: { tournament_id: tournamentId }
            });
            setCategories(response.data);
        } catch (error) {
            setError("Ошибка загрузки категорий");
        } finally {
            setLoadingCategories(false);
        }
    }, [tournamentId]);

    useEffect(() => {
        if (tournamentId) {
            fetchTournament();
            fetchCategories();
        }
    }, [fetchTournament, fetchCategories, tournamentId]);

    const toggleFinished = async (status) => {
        await axios.put(
            `/tournaments/${tournamentId}`,
            { is_finished: status, creator_id, salt: salt }
        )
            .then(() => setTournament(prev => ({ ...prev, is_finished: status })))
            .catch(error => console.error("Ошибка изменения статуса:", error));
    };

    const deleteTournament = () => {
        if (window.confirm("Вы уверены, что хотите удалить турнир?")) {
            axios.delete(
                `/tournaments/${tournamentId}`,
                { data: { creator_id, salt: salt } }
            )
                .then(() => navigate("/tournaments"))
                .catch(error => console.error("Ошибка удаления турнира:", error));
        }
    };

    useHelmetTitle(tournament ? tournament.name : "Турнир");

    if (loadingTournament || loadingCategories) {
        return <Spinner animation="border" />;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    if (!tournament) {
        return <p>Турнир не найден</p>;
    }

    return (
        <Row className="mt-4 g-4">
            <Col xs={12} md={6} >
                <Card className="p-4" style={{ width: "100%" }}>
                    <h2>{tournament.name}</h2>
                    <p><strong>Контроль времени:</strong> {tournament.game_time}:{tournament.move_time}</p>
                    <p><strong>Старт:</strong> {new Date(tournament.start).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</p>
                    <p><strong>Статус:</strong> {tournament.is_finished ? "Завершен" : "Не завершен"}</p>
                    {(((creator_id && creator_id === tournament.creator_id) && isAuthenticated()) || isAdmin()) && (
                        <div className="d-flex gap-2">
                            <Button variant="primary" onClick={() => toggleFinished(!tournament.is_finished)}>
                                {tournament.is_finished ? "Отметить как не завершенный" : "Отметить как завершенный"}
                            </Button>
                            <Button variant="dark" onClick={() => navigate(`/tournaments/${tournamentId}/edit`)}>Изменить</Button>
                            <Button variant="outline-warning" onClick={deleteTournament}>Удалить</Button>
                        </div>
                    )}
                </Card>
            </Col>
            <Col xs={12} md={6} className="d-flex flex-column">
                <ListGroup className="mb-3">
                    <ListGroup.Item variant="primary">Список категорий</ListGroup.Item>
                    {categories.map(category => (
                        <ListGroup.Item
                            key={category.id}
                            variant="warning"
                            className="d-flex justify-content-between align-items-center"
                        >
                            {category.name}
                            <div className="d-flex gap-2">
                                <Link to={`/categories/${category.id}`}>
                                    <Button variant="outline-primary">Посмотреть</Button>
                                </Link>
                                {(((creator_id && creator_id === tournament.creator_id) && isAuthenticated()) || isAdmin()) && (
                                    <Button
                                        variant="outline-dark"
                                        onClick={() => {
                                            setEditingCategory(category);
                                            setShowModal(true);
                                        }}
                                    >
                                        Изменить имя
                                    </Button>
                                )}
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
                {(((creator_id && creator_id === tournament.creator_id) && isAuthenticated()) || isAdmin()) && (
                    <Button
                        variant="primary"
                        className="mt-3"
                        onClick={() => {
                            setEditingCategory(null);
                            setShowModal(true);
                        }}
                    >
                        Добавить категорию
                    </Button>
                )}
            </Col>
            <CategoryModal
                show={showModal}
                onHide={() => {
                    setShowModal(false);
                    setEditingCategory(null);
                }}
                category={editingCategory}
                tournamentId={tournamentId}
                onSave={() => {
                    fetchCategories();
                }}
            />
        </Row>
    );
};

export default Tournament;
