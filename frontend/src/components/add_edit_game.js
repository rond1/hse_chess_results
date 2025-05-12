import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import axios from "../instances/axiosInstance";

const GameModal = ({ show, onHide, game, roundId, onSave }) => {
    const salt = process.env.REACT_APP_SALT;
    const [board, setBoard] = useState("");
    const [whitePlayer, setWhitePlayer] = useState("");
    const [blackPlayer, setBlackPlayer] = useState("");
    const [result, setResult] = useState("");
    const [movesText, setMovesText] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (show) {
            setBoard(game?.board || 1);
            setWhitePlayer(game?.white_player || "");
            setBlackPlayer(game?.black_player || "");
            setResult(game?.result || "");
            setMovesText(game?.moves || "");
            setError("");
        }
    }, [show, game]);

    const handleSave = useCallback(() => {
        if (!Number.isInteger(board) || !whitePlayer.trim() || !blackPlayer.trim() || board < 1 || board > 100) return;

        setSaving(true);
        setError("");

        const request = game
            ? axios.put(`/games/${game.id}`, {
                board: board, white_player: whitePlayer, black_player: blackPlayer, result: result, salt: salt, moves: movesText
            })
            : axios.post(`/games`, {
                board: board, white_player: whitePlayer, black_player: blackPlayer, result: result, round_id: roundId, salt: salt, moves: movesText
            });

        request
            .then(() => {
                onSave();
                onHide();
            })
            .catch(() => {
                setError("Не удалось сохранить партию. Попробуйте еще раз.");
            })
            .finally(() => setSaving(false));
    }, [game, board, whitePlayer, blackPlayer, result, roundId, onSave, onHide, salt, movesText]);

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{game ? "Редактировать партию" : "Добавить партию"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form>
                    <Form.Group className="mb-3" controlId="board">
                        <Form.Label>Доска</Form.Label>
                        <Form.Control
                            type="number"
                            value={board}
                            onChange={(e) => setBoard(Number(e.target.value))}
                            placeholder="Введите номер доски"
                            disabled={saving}
                            min={1}
                            max={100}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="whitePlayer">
                        <Form.Label>Белые</Form.Label>
                        <Form.Control
                            type="text"
                            value={whitePlayer}
                            onChange={(e) => setWhitePlayer(e.target.value)}
                            placeholder="Введите ФИ игрока за белых"
                            disabled={saving}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="blackPlayer">
                        <Form.Label>Черные</Form.Label>
                        <Form.Control
                            type="text"
                            value={blackPlayer}
                            onChange={(e) => setBlackPlayer(e.target.value)}
                            placeholder="Введите ФИ игрока за черных"
                            disabled={saving}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="result">
                        <Form.Label>Результат</Form.Label>
                        <Form.Select
                            value={result}
                            onChange={(e) => setResult(e.target.value)}
                            disabled={saving}
                        >
                            <option value="">Нет</option>
                            <option value="1-0">1 - 0</option>
                            <option value="0-1">0 - 1</option>
                            <option value="½-½">½ - ½</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="moves">
                        <Form.Label>Ходы (вставьте формат SAN)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            value={movesText}
                            onChange={(e) => setMovesText(e.target.value)}
                            placeholder="Введите ходы (например, e2 e4 e7 e5 или e2-e4 e7-e5)"
                            disabled={saving}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-warning" onClick={onHide} disabled={saving}>
                    Закрыть
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={!board || board < 1 || board > 100 || !whitePlayer.trim() || !blackPlayer.trim() || saving}
                >
                    {saving ? <Spinner animation="border" size="sm" /> : "Сохранить"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default GameModal;