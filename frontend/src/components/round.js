import React, { useEffect, useState, useCallback, useContext, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {Button, Spinner, Container, Alert, Table, Dropdown} from "react-bootstrap";
import { getUserInfo, isAdmin, isAuthenticated } from "./auth";
import { useHelmetTitle } from "../hooks/indexHooks";
import RoundsContext from "../contexts/RoundsContext";
import RoundModal from "./add_edit_round";
import GameModal from "./add_edit_game";
import PgnUploader from "./pgn";
import MovesModal from "./moves_modal";
import axios from "../instances/axiosInstance";

const Round = () => {
    const salt = process.env.REACT_APP_SALT;
    const userInfo = getUserInfo();
    const creator_id = userInfo ? Number(userInfo.id) : null;
    const { roundId } = useParams();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);

    const [round, setRound] = useState(null);
    const [games, setGames] = useState([]);
    const [loadingRound, setLoadingRound] = useState(true);
    const [loadingGames, setLoadingGames] = useState(true);
    const [error, setError] = useState(null);
    const [showModalRound, setShowModalRound] = useState(false);
    const [showModalGame, setShowModalGame] = useState(false);
    const [showMovesModal, setShowMovesModal] = useState(false);
    const [editingGame, setEditingGame] = useState(null);
    const [editingRound, setEditingRound] = useState(null);
    const [selectedGameMoves, setSelectedGameMoves] = useState("");

    const showActions = useMemo(() => {
        if (!round) return false;
        return (
            (((creator_id && creator_id === round.creator_id) && isAuthenticated()) || isAdmin()) ||
            games.some(game => game.moves && game.moves.trim() !== "")
        );
    }, [creator_id, round, games]);

    const { fetchRounds } = useContext(RoundsContext);

    const fetchRound = useCallback(async () => {
        try {
            const response = await axios.get(`/rounds/${roundId}`);
            setRound(response.data);
        } catch (error) {
            setError("Ошибка загрузки тура");
        } finally {
            setLoadingRound(false);
        }
    }, [roundId]);

    const fetchGames = useCallback(async () => {
        try {
            const response = await axios.get(`/games?round_id=${roundId}`);
            setGames(response.data);
        } catch (error) {
            setError("Ошибка загрузки игр");
        } finally {
            setLoadingGames(false);
        }
    }, [roundId]);

    useEffect(() => {
        fetchRound();
        fetchGames();
    }, [fetchRound, fetchGames]);

    const deleteRound = () => {
        if (window.confirm("Вы уверены, что хотите удалить тур?")) {
            axios.delete(`/rounds/${roundId}`, { data: { salt: salt } })
                .then(() => navigate(`/categories/${round?.category_id}`))
                .catch(error => console.error("Ошибка удаления тура:", error));
        }
    };

    const deleteGame = (gameId) => {
        if (window.confirm("Вы уверены, что хотите удалить игру?")) {
            axios.delete(`/games/${gameId}`, { data: { salt: salt } })
                .then(() => fetchGames())
                .catch(error => console.error("Ошибка удаления игры:", error));
        }
    };

    useHelmetTitle(round ? round.name : "Тур");

    if (loadingRound || loadingGames) {
        return <Spinner animation="border" />;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    if (!round) {
        return <p>Тур не найден</p>;
    }

    const handleViewMoves = (game) => {
        setSelectedGameMoves(game.moves);
        setShowMovesModal(true);
    };

    return (
        <Container className="mt-4">
            <div className="d-flex align-items-start gap-2 mt-3">
                <h3 className="mb-0">{round.name} Начало: {new Date(round.date).toLocaleString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit' })}</h3>
                {(((creator_id && creator_id === round.creator_id) && isAuthenticated()) || isAdmin()) && (
                    <Dropdown show={showDropdown} onToggle={() => setShowDropdown(!showDropdown)}>
                        <Dropdown.Toggle variant="warning" className="text-light border-0"></Dropdown.Toggle>
                        <Dropdown.Menu>
                            <>
                                <Dropdown.Item onClick={() => {
                                    setEditingRound(round);
                                    setShowModalRound(true);
                                }}>
                                    Изменить
                                </Dropdown.Item>
                                <Dropdown.Item className="text-warning" onClick={deleteRound}>Удалить</Dropdown.Item>
                            </>
                        </Dropdown.Menu>
                    </Dropdown>
                )}
            </div>

            {(((creator_id && creator_id === round.creator_id) && isAuthenticated()) || isAdmin()) && (
                <PgnUploader roundId={roundId} onSuccess={fetchGames} />
            )}

            <Table striped bordered hover className="mt-3">
                <thead className="table-primary">
                    <tr>
                        <th>Доска</th>
                        <th>Белые</th>
                        <th>Результат</th>
                        <th>Черные</th>
                        {showActions && (
                            <th>Действия</th>
                        )}
                    </tr>
                </thead>
                <tbody className="table-warning">
                    {games.map(game => (
                        <tr key={game.id}>
                            <td>{game.board}</td>
                            <td>{game.white_player}</td>
                            <td>{game.result}</td>
                            <td>{game.black_player}</td>
                            {showActions && (
                                <td>
                                    <>
                                        {(((creator_id && creator_id === round.creator_id) && isAuthenticated()) || isAdmin()) && (
                                            <>
                                                <Button
                                                    className="me-2"
                                                    variant="outline-dark"
                                                    onClick={() => {
                                                        setEditingGame(game);
                                                        setShowModalGame(true);
                                                    }}
                                                >
                                                    Редактировать
                                                </Button>
                                                <Button className="me-2" variant="outline-warning" onClick={() => deleteGame(game.id)}>Удалить</Button>
                                            </>
                                        )}
                                        {game.moves && game.moves.trim() !== "" && (
                                            <Button
                                                variant="outline-primary"
                                                onClick={() => handleViewMoves(game)}
                                            >
                                                Посмотреть партию
                                            </Button>
                                        )}
                                    </>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </Table>

            {(((creator_id && creator_id === round.creator_id) && isAuthenticated()) || isAdmin()) && (
                <div className="d-flex gap-2 mt-2">
                    <Button
                        variant="primary"
                        onClick={() => {
                            setEditingGame(null);
                            setShowModalGame(true);
                        }}
                    >
                        Добавить игру
                    </Button>
                </div>
            )}

            <GameModal
                show={showModalGame}
                onHide={() => setShowModalGame(false)}
                game={editingGame}
                roundId={roundId}
                onSave={() => {
                    fetchGames();
                }}
            />

            <RoundModal
                show={showModalRound}
                onHide={() => {
                    setShowModalRound(false);
                    setEditingRound(null);
                }}
                round={editingRound}
                categoryId={round.category_id}
                onSave={() => {
                    fetchRound();
                    fetchRounds();
                }}
            />

            <MovesModal
                show={showMovesModal}
                onHide={() => setShowMovesModal(false)}
                moves={selectedGameMoves}
            />
        </Container>
    );
};

export default Round;