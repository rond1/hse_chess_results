import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, Button, Spinner, Container, Alert } from "react-bootstrap";
import { getUserInfo, isAdmin, isAuthenticated } from "./auth";
import { useHelmetTitle } from "../hooks/indexHooks";
import axios from "../instances/axiosInstance";

const Category = () => {
    const salt = process.env.REACT_APP_SALT;
    const userInfo = getUserInfo();
    const creator_id = userInfo ? Number(userInfo.id) : null;
    const { categoryId } = useParams();
    const navigate = useNavigate();

    const [category, setCategory] = useState(null);
    const [rounds, setRounds] = useState([]);
    const [loadingCategory, setLoadingCategory] = useState(true);
    const [loadingRounds, setLoadingRounds] = useState(true);
    const [error, setError] = useState(null);

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
        <Container className="mt-4">
            <Card className="p-4" style={{ width: "100%" }}>
                <h2>{category.name}</h2>
                {rounds.length > 0 ? (
                    <ul>
                        {rounds.map(round => (
                            <li key={round.id}>
                                <Link to={`/rounds/${round.id}`} className="text-primary">Тур {round.name} </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Туры ещё не добавлены.</p>
                )}
                {(((creator_id && creator_id === category.creator_id) && isAuthenticated()) || isAdmin()) && (
                    <div className="d-flex gap-2 mt-2">
                        <Button variant="outline-warning" onClick={deleteCategory}>Удалить категорию</Button>
                    </div>
                )}
            </Card>
        </Container>
    );
};

export default Category;