import React from "react";
import {Container, Button, Row, Col, Card} from "react-bootstrap";
import {isAdmin} from "./auth";
import {useNavigate} from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();
    const onClick = (event, arg) => {
        event.preventDefault();
        navigate(`/${arg}`);
    }
    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card className="shadow-lg p-4">
                        <Card.Body>
                            <h1 className="text-center mb-4">Следи за турнирами НИУ ВШЭ!</h1>
                            <div className="d-flex justify-content-center gap-3">
                                <Button variant="primary"
                                        size="lg"
                                        onClick={(e) => onClick(e, "tournaments")}
                                >
                                    Турниры
                                </Button>
                                {isAdmin() && (
                                    <Button variant="outline-warning" size="lg"
                                            onClick={(e) => onClick(e, "users")}
                                    >
                                        Заявки на регистрацию
                                    </Button>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Home;
