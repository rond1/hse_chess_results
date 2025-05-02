import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Card, Button, Spinner } from "react-bootstrap";

const User = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const facs = {
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
    };

    const degrees = {
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
    };

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

    const toggleActivation = (status) => {
        axios.put(`http://127.0.0.1:5000/api/users/${id}`,
            { is_activated: status },
            { headers: { "Content-Type": "application/json" } }
        )
            .then(() => setUser(prev => ({ ...prev, is_activated: status })))
            .catch(error => console.error("Ошибка изменения статуса:", error));
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
