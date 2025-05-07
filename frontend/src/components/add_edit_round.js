import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import axios from "../instances/axiosInstance";

const RoundModal = ({ show, onHide, round, categoryId, onSave }) => {
    const salt = process.env.REACT_APP_SALT;
    const [roundName, setRoundName] = useState("");
    const [roundDate, setRoundDate] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (show) {
            setRoundName(round?.name || "");
            setRoundDate(round?.date ? round.date.slice(0, 16) : "");
            setError("");
        }
    }, [show, round]);

    const handleSave = useCallback(() => {
        if (!roundName.trim() || !roundDate) return;

        setSaving(true);
        setError("");

        const request = round
            ? axios.put(`/rounds/${round.id}`, {name: roundName, date: roundDate, salt: salt,})
            : axios.post(`/rounds`, {name: roundName, date: roundDate, salt: salt, category_id: categoryId});

        request
            .then(() => {
                onSave();
                onHide();
            })
            .catch(() => {
                setError("Не удалось сохранить тур. Попробуйте еще раз.");
            })
            .finally(() => setSaving(false));
    }, [round, roundName, roundDate, categoryId, onSave, onHide, salt]);

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{round ? "Редактировать тур" : "Добавить тур"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form>
                    <Form.Group className="mb-3" controlId="roundName">
                        <Form.Label>Название тура</Form.Label>
                        <Form.Control
                            type="text"
                            value={roundName}
                            onChange={(e) => setRoundName(e.target.value)}
                            placeholder="Введите название тура"
                            disabled={saving}
                        />
                    </Form.Group>
                    <Form.Group controlId="roundDate">
                        <Form.Label>Дата и время начала</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={roundDate}
                            onChange={(e) => setRoundDate(e.target.value)}
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
                    disabled={!roundName.trim() || !roundDate || saving}
                >
                    {saving ? <Spinner animation="border" size="sm" /> : "Сохранить"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default RoundModal;
