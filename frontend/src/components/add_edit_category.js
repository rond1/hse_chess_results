import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";

const CategoryModal = ({ show, onHide, category, tournamentId, onSave }) => {
    const salt = process.env.REACT_APP_SALT;
    const [name, setName] = useState("");

    useEffect(() => {
        setName(category?.name || "");
    }, [category]);

    const handleSubmit = () => {
        const data = { name, tournament_id: tournamentId, salt: salt };

        const request = category
            ? axios.put(`http://127.0.0.1:5000/api/categories/${category.id}`, data)
            : axios.post("http://127.0.0.1:5000/api/categories", data);

        request
            .then(() => {
                onSave();
                onHide();
            })
            .catch((err) => {
                console.error("Ошибка при сохранении:", err);
            });
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{category ? "Редактировать" : "Добавить"} категорию</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>Название</Form.Label>
                        <Form.Control
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Введите название"
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="dark" onClick={onHide}>Отмена</Button>
                <Button variant="primary" onClick={handleSubmit}>Сохранить</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CategoryModal;