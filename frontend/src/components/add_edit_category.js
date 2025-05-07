import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import axios from "../instances/axiosInstance";

const CategoryModal = ({ show, onHide, category, tournamentId, onSave }) => {
    const salt = process.env.REACT_APP_SALT;
    const [categoryName, setCategoryName] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (show) {
            setCategoryName(category?.name || "");
            setError("");
        }
    }, [show, category]);

    const handleSave = useCallback(() => {
        if (!categoryName.trim()) return;

        setSaving(true);
        setError("");

        const request = category
            ? axios.put(`/categories/${category.id}`, { name: categoryName, salt: salt })
            : axios.post(`/categories`, { name: categoryName, tournament_id: tournamentId, salt: salt });

        request
            .then(() => {
                onSave();
                onHide();
            })
            .catch((err) => {
                console.error("Ошибка при сохранении категории:", err);
                setError("Не удалось сохранить категорию. Попробуйте еще раз.");
            })
            .finally(() => setSaving(false));
    }, [category, categoryName, tournamentId, onSave, onHide, salt]);

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{category ? "Редактировать категорию" : "Добавить категорию"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form>
                    <Form.Group controlId="categoryName">
                        <Form.Label>Название категории</Form.Label>
                        <Form.Control
                            type="text"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            placeholder="Введите название категории"
                            disabled={saving}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={saving}>
                    Закрыть
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={!categoryName.trim() || saving}>
                    {saving ? <Spinner animation="border" size="sm" /> : "Сохранить"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CategoryModal;
