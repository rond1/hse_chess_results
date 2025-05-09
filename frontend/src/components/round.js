import React, { useEffect, useState, useCallback, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Spinner, Container, Alert } from "react-bootstrap";
import { getUserInfo, isAdmin, isAuthenticated } from "./auth";
import { useHelmetTitle } from "../hooks/indexHooks";
import RoundsContext from "../contexts/RoundsContext";
import RoundModal from "./add_edit_round"
import axios from "../instances/axiosInstance";

const Round = () => {
    const salt = process.env.REACT_APP_SALT;
    const userInfo = getUserInfo();
    const creator_id = userInfo ? Number(userInfo.id) : null;
    const { roundId } = useParams();
    const navigate = useNavigate();

    const [round, setRound] = useState(null);
    const [loadingRound, setLoadingRound] = useState(true);
    const [error, setError] = useState(null);
    const [showModalRound, setShowModalRound] = useState(false);
    const [editingRound, setEditingRound] = useState(null);

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

    useEffect(() => {
        fetchRound();
    }, [fetchRound]);

    const deleteRound = () => {
        if (window.confirm("Вы уверены, что хотите удалить тур?")) {
            axios.delete(`/rounds/${roundId}`, {
                data: { salt: salt }
            })
                .then(() => navigate(`/categories/${round?.category_id}`))
                .catch(error => console.error("Ошибка удаления тура:", error));
        }
    };

    useHelmetTitle(round ? round.name : "Тур");

    if (loadingRound) {
        return <Spinner animation="border" />;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    if (!round) {
        return <p>Тур не найден</p>;
    }

    return (
        <Container className="mt-4">
            <h2>{round.name} Начало: {new Date(round.date).toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit' })}
            </h2>
            {(((creator_id && creator_id === round.creator_id) && isAuthenticated()) || isAdmin()) && (
                <div className="d-flex gap-2 mt-2">
                    <Button
                        variant="primary"
                        onClick={() => {
                            setEditingRound(round);
                            setShowModalRound(true);
                        }}
                    >
                        Изменить
                    </Button>
                    <Button variant="outline-warning" onClick={deleteRound}>Удалить</Button>
                </div>
            )}
            <RoundModal
                show={showModalRound}
                onHide={() => {
                    setShowModalRound(false);
                    setEditingRound(null);
                }}
                round={editingRound}
                categoryId={roundId}
                onSave={() => {
                    fetchRound();
                    fetchRounds();
                }}
            />
        </Container>
    );
};

export default Round;