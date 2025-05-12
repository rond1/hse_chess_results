import React from "react";
import { Modal, Button } from "react-bootstrap";

const MovesModal = ({ show, onHide, moves }) => (
    <Modal show={show} onHide={onHide}>
        <Modal.Header closeButton>
            <Modal.Title>Ходы партии</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <pre>{moves}</pre>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
                Закрыть
            </Button>
        </Modal.Footer>
    </Modal>
);

export default MovesModal;