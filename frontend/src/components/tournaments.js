import React, { useEffect, useState } from "react";
import axios from "axios";
import { ListGroup, Container, Spinner, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { isAuthenticated } from "./auth";
import { useNavigate } from "react-router-dom";

const TournamentList = () => {
    const navigate = useNavigate();
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("http://127.0.0.1:5000/api/tournaments")
            .then((response) => {
                setTournaments(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Ошибка загрузки:", error);
                setLoading(false);
            });
    }, []);

    return (
        <Container className="mt-4">
            {loading ? (
                <Spinner animation="border" />
            ) : (
                <ListGroup>
                    <ListGroup.Item variant="primary">Список турниров</ListGroup.Item>
                    {tournaments.map((tournament) => (
                        <ListGroup.Item variant="warning" key={tournament.id} className="d-flex justify-content-between align-items-center">
                            {`${tournament.name} ${tournament.game_time}:${tournament.move_time} | ${tournament.is_finished ? ' Турнир завершен' : ''} Начало: ${new Date(tournament.start).toLocaleString('ru-RU', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}`}
                            <Link to={`/tournaments/${tournament.id}`}>
                                <Button variant="outline-primary">Посмотреть</Button>
                            </Link>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
            {isAuthenticated() && (<Button variant="primary" className="mt-3" onClick={() => navigate("/tournaments/add")}>Добавить турнир</Button>)}
        </Container>
    );
};

export default TournamentList;
