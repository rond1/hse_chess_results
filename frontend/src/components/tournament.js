import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Card, Button, Spinner } from "react-bootstrap";
import { getUserInfo, isAdmin, isAuthenticated } from "./auth";

const Tournament = () => {
    const creator_id = getUserInfo().id;
    const { tournamentId } = useParams();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`http://127.0.0.1:5000/api/tournaments/${tournamentId}`)
            .then(response => {
                setTournament(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Ошибка загрузки турнира:", error);
                setLoading(false);
            });
    }, [tournamentId]);

    const toggleFinished = (status) => {
        axios.put(`http://127.0.0.1:5000/api/tournaments/${tournamentId}`,
            {
                is_finished: status,
                creator_id: creator_id,
                salt: "salt"
            },
            {
                headers: { "Content-Type": "application/json" }
            }
        )
            .then(() => {setTournament(prev => ({ ...prev, is_finished: status }))})
            .catch(error => console.error("Ошибка изменения статуса:", error));
    };


    const deleteTournament = () => {
        if (window.confirm("Вы уверены, что хотите удалить турнир?")) {
            axios.delete(`http://127.0.0.1:5000/api/tournaments/${tournamentId}`, {
                headers: { "Content-Type": "application/json" },
                data: { creator_id: creator_id, salt: "salt" }
            })
                .then(() => {
                    navigate("/tournaments");
                })
        }
    };

    if (loading) return <Spinner animation="border" />;
    if (!tournament) return <p>Турнир не найден</p>;

    return (
        <Container className="mt-4">
            <Card className="p-4">
                <h2>{tournament.name}</h2>
                <p><strong>Контроль времени:</strong> {tournament.game_time}:{tournament.move_time}</p>
                <p><strong>Старт:</strong> {tournament.start}</p>
                <p><strong>Статус:</strong> {tournament.is_finished ? "Не завершен" : "Завершен"}</p>
                {((creator_id === tournament.creator_id && isAuthenticated()) || isAdmin()) && (
                    <div className="d-flex gap-2">
                        <Button variant="primary" onClick={() => toggleFinished(!tournament.is_finished)}>
                            {tournament.is_finished ? "Отметить как не завершенный" : "Отметить как завершенный"}
                        </Button>
                        <Button variant="secondary" onClick={() => navigate(`/tournaments/${tournamentId}/edit`)}>Изменить</Button>
                        <Button variant="dark" onClick={deleteTournament}>Удалить</Button>
                    </div>
                )}
            </Card>
        </Container>
    );
};

export default Tournament;
