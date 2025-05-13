import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../instances/axiosInstance";
import { Container, Card, Button, Spinner, Alert } from "react-bootstrap";
import { useHelmetTitle } from "../hooks/indexHooks";

const User = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const facs = React.useMemo(() => ({
        "cs": "Факультет компьютерных наук",
        "math": "Факультет математики",
        "soc": "Факультет социальных наук",
        "wep": "Факультет мировой экономики и мировой политики",
        "ci": "Факультет креативных индустрий",
        "geo": "Факультет географии и геоинформационных технологий",
        "hum": "Факультет гуманитарных наук",
        "law": "Факультет права",
        "bm": "Факультет бизнеса и менеджмента",
        "cmd": "Факультет коммуникаций, медиа и дизайна",
        "edu": "Институт образования",
        "trans": "Институт экономики транспорта и транспортной политики",
        "stat": "Институт статистических исследований и экономики знаний",
        "demo": "Институт демографии",
        "law_dev": "Институт права и развития",
        "miem": "Московский институт электроники и математики (МИЭМ)"
    }), []);

    const degrees = React.useMemo(() => ({
        "1": "1 курс бакалавриата",
        "2": "2 курс бакалавриата",
        "3": "3 курс бакалавриата",
        "4": "4 курс бакалавриата",
        "5": "1 курс специалитета",
        "6": "2 курс специалитета",
        "7": "3 курс специалитета",
        "8": "4 курс специалитета",
        "9": "5 курс специалитета",
        "10": "1 курс магистратуры",
        "11": "2 курс магистратуры",
        "12": "1 курс аспирантуры",
        "13": "2 курс аспирантуры",
        "14": "3 курс аспирантуры",
        "15": "Выпускник"
    }), []);

    const handleError = useCallback((error) => {
        console.error("Ошибка загрузки пользователя:", error);
        setError("Не удалось загрузить информацию о пользователе. Попробуйте позже.");
        setIsLoading(false);
    }, []);

    useEffect(() => {
        axios.get(`/users/${id}`)
            .then(response => {
                setUser(response.data);
                setIsLoading(false);
            })
            .catch(handleError);
    }, [id, handleError]);

    const toggleActivation = useCallback((status) => {
        axios.put(`/users/${id}`, { is_activated: status })
            .then(() => setUser(prev => ({ ...prev, is_activated: status })))
            .catch(error => console.error("Ошибка изменения статуса:", error));
    }, [id]);

    const deleteUser = useCallback(() => {
        axios.delete(`/users/${id}`)
            .then(() => navigate("/users", { replace: true }))
            .catch(error => console.error("Ошибка удаления:", error));
    }, [id, navigate]);

    useHelmetTitle(user?.fio || "Пользователь");

    if (isLoading) return <Spinner animation="border" />;
    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!user) return <p>Пользователь не найден</p>;

    return (
        <Container className="mt-4">
            <Card className="p-4">
                <h2>{user.fio}</h2>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Факультет:</strong> {facs[user.faculty]}</p>
                <p><strong>Ступень образования:</strong> {degrees[user.degree]}</p>
                <p><strong>Статус:</strong> {user.is_activated ? "Активирован" : "Не активирован"}</p>
                <div className="d-flex gap-2">
                    <Button variant="primary" onClick={() => toggleActivation(!user.is_activated)}>
                        {user.is_activated ? "Деактивировать" : "Активировать"}
                    </Button>
                    <Button variant="outline-warning" onClick={deleteUser}>Удалить</Button>
                </div>
            </Card>
        </Container>
    );
};

export default User;
