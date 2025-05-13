import React, {useCallback, useEffect, useState} from "react";
import axios from "../instances/axiosInstance";
import { ListGroup, Container, Spinner, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import CustomPagination from "./pagination";
import { useHelmetTitle } from "../hooks/indexHooks";

const TournamentList = () => {
    useHelmetTitle("Турниры");

    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const tournamentsPerPage = 10;

    const handleError = (error) => {
        console.error(error);
        setError("Не удалось загрузить турниры. Попробуйте позже.");
    };

    const fetchTournaments = useCallback( async () => {
        try {
            const response = await axios.get(`/tournaments`, {
                params: {
                    page: currentPage,
                    per_page: tournamentsPerPage
                }
            });
            setTournaments(response.data.tournaments);
            setTotalPages(response.data.pages);
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        fetchTournaments();
    }, [fetchTournaments]);

    const TournamentItem = React.memo(({ tournament }) => (
        <ListGroup.Item variant="warning" className="d-flex justify-content-between align-items-center">
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
    ));

    return (
        <Container className="mt-4">
            {error && <Alert variant="danger">{error}</Alert>}
            {loading ? (
                <Spinner animation="border" />
            ) : (
                <ListGroup>
                    <ListGroup.Item variant="primary">Список турниров</ListGroup.Item>
                    {tournaments.map((tournament) => (
                        <TournamentItem key={tournament.id} tournament={tournament} />
                    ))}
                </ListGroup>
            )}

            <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                    setCurrentPage(page);
                    setLoading(true);
                }}
            />

            <Link to="/tournaments/add">
                <Button variant="primary" className="mt-3">Добавить турнир</Button>
            </Link>
        </Container>
    );
};

export default TournamentList;
