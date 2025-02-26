import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Card, Button, Spinner } from "react-bootstrap";

const User = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`http://127.0.0.1:5000/api/users/${id}`)
            .then(response => {
                setUser(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Ошибка загрузки пользователя:", error);
                setLoading(false);
            });
    }, [id]);

    const activateUser = () => {
        axios.put(`http://127.0.0.1:5000/api/users/${id}`,
            { is_activated: true },
            { headers: { "Content-Type": "application/json" } }
        )
            .then(() => setUser(prev => ({ ...prev, is_activated: true })))
            .catch(error => console.error("Ошибка активации:", error));
    };

    const deleteUser = () => {
        axios.delete(`http://127.0.0.1:5000/api/users/${id}`)
            .then(() => navigate("/users"))
            .catch(error => console.error("Ошибка удаления:", error));
    };

    if (loading) return <Spinner animation="border" />;
    if (!user) return <p>Пользователь не найден</p>;

    return (
        <Container className="mt-4">
            <Card className="p-4">
                <h2>{user.fio}</h2>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Факультет:</strong> {user.faculty}</p>
                <p><strong>Ступень образования:</strong> {user.degree}</p>
                <p><strong>Статус:</strong> {user.is_activated ? "Активирован" : "Не активирован"}</p>
                <div className="d-flex gap-2">
                    {!user.is_activated && (
                        <Button variant="primary" onClick={activateUser}>Активировать</Button>
                    )}
                    <Button variant="dark" onClick={deleteUser}>Удалить</Button>
                </div>
            </Card>
        </Container>
    );
};

export default User;
