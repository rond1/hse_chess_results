import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import { Card, Button, Spinner, Container, Alert } from "react-bootstrap";
import { getUserInfo, isAdmin, isAuthenticated } from "./auth";
import { useHelmetTitle } from "../hooks/indexHooks";
import RoundsContext from "../contexts/RoundsContext";
import RoundModal from "./add_edit_round"
import axios from "../instances/axiosInstance";

const Category = () => {
    const salt = process.env.REACT_APP_SALT;
    const userInfo = getUserInfo();
    const creator_id = userInfo ? Number(userInfo.id) : null;
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [category, setCategory] = useState(null);
    const [rounds, setRounds] = useState([]);
    const [loadingCategory, setLoadingCategory] = useState(true);
    const [loadingRounds, setLoadingRounds] = useState(true);
    const [error, setError] = useState(null);
    const [showModalRound, setShowModalRound] = useState(false);
    const [editingRound, setEditingRound] = useState(null);

    const fetchCategory = useCallback(async () => {
        try {
            const response = await axios.get(`/categories/${categoryId}`);
            setCategory(response.data);
        } catch (error) {
            setError("Ошибка загрузки категории");
        } finally {
            setLoadingCategory(false);
        }
    }, [categoryId]);

    const fetchRounds = useCallback(async () => {
        try {
            const response = await axios.get(`/rounds`, {
                params: { category_id: categoryId }
            });
            setRounds(response.data);
        } catch (error) {
            setError("Ошибка загрузки туров");
        } finally {
            setLoadingRounds(false);
        }
    }, [categoryId]);

    useEffect(() => {
        fetchCategory();
        fetchRounds();
    }, [fetchCategory, fetchRounds]);

    useEffect(() => {
        if (location.state?.refresh) {
            fetchRounds();
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, fetchRounds, navigate]);

    const deleteCategory = () => {
        if (window.confirm("Вы уверены, что хотите удалить категорию?")) {
            axios.delete(`/categories/${categoryId}`, {
                data: { salt: salt }
            })
                .then(() => navigate(`/tournaments/${category?.tournament_id}`))
                .catch(error => console.error("Ошибка удаления категории:", error));
        }
    };

    useHelmetTitle(category ? category.name : "Категория");

    if (loadingCategory || loadingRounds) {
        return <Spinner animation="border" />;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    if (!category) {
        return <p>Категория не найдена</p>;
    }

    return (
        <RoundsContext.Provider value={{ fetchRounds }}>
            <Container className="mt-4">
                <Card className="p-4" style={{ width: "100%" }}>
                    <h2>{category.name}</h2>
                    {rounds.length > 0 ? (
                        <div className="d-flex flex-wrap gap-3">
                            {rounds.map(round => (
                                <Link key={round.id} to={`rounds/${round.id}`} className="text-primary">
                                    {round.name} {new Date(round.date).toLocaleString('ru-RU', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit' })}   </Link>
                            ))}
                        </div>
                    ) : (
                        <p>Туры ещё не добавлены.</p>
                    )}
                    {(((creator_id && creator_id === category.creator_id) && isAuthenticated()) || isAdmin()) && (
                        <div className="d-flex gap-2 mt-2">
                            <Button
                                variant="primary"
                                onClick={() => {
                                    setEditingRound(null);
                                    setShowModalRound(true);
                                }}
                            >
                                Добавить тур
                            </Button>
                            <Button variant="outline-warning" onClick={deleteCategory}>Удалить категорию</Button>
                        </div>
                    )}
                </Card>

                <Container className="mt-4">
                    <Outlet />
                </Container>

                <RoundModal
                    show={showModalRound}
                    onHide={() => {
                        setShowModalRound(false);
                        setEditingRound(null);
                    }}
                    round={editingRound}
                    categoryId={categoryId}
                    onSave={fetchRounds}
                />
            </Container>
        </RoundsContext.Provider>
    );
};

export default Category;