import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {Card, Button, Spinner, Container} from "react-bootstrap";
import { getUserInfo, isAdmin, isAuthenticated } from "./auth";
import {useHelmetTitle} from "../hooks/indexHooks";

const Category = () => {
    const userInfo = getUserInfo();
    const creator_id = userInfo ? Number(userInfo.id) : null;
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:5000/api/categories/${categoryId}`);
                setCategory(response.data);
            } catch (error) {
                console.error("Ошибка загрузки категории:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategory();
    }, [categoryId]);

    const deleteCategory = () => {
        if (window.confirm("Вы уверены, что хотите удалить категорию?")) {
            axios.delete(
                `http://127.0.0.1:5000/api/categories/${categoryId}`,
                { headers: { "Content-Type": "application/json" }, data: { salt: "salt" } }
            )
                .then(() => navigate(`/tournaments/${category.tournament_id}`))
                .catch(error => console.error("Ошибка удаления категории:", error));
        }
    };

    useHelmetTitle(category ? category.name : "Категория");

    if (loading) {
        return <Spinner animation="border" />;
    }

    if (!category) {
        return <p>Категория не найдена</p>;
    }

    return (
        <Container className="mt-4">
            <Card className="p-4" style={{ width: "100%" }}>
                <h2>{category.name}</h2>
                {(((creator_id && creator_id === category.creator_id) && isAuthenticated()) || isAdmin()) && (
                    <div className="d-flex gap-2 mt-2">
                        <Button variant="outline-warning" onClick={deleteCategory}>Удалить</Button>
                    </div>
                )}
            </Card>
        </Container>
    );
};

export default Category;