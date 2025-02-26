import React, { useEffect, useState } from "react";
import axios from "axios";
import { ListGroup, Container, Spinner, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("http://127.0.0.1:5000/api/users")
            .then((response) => {
                setUsers(response.data);
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
                    <ListGroup.Item variant="primary">Список пользователей</ListGroup.Item>
                    {users.map((user) => (
                        <ListGroup.Item variant="dark" key={user.id} className="d-flex justify-content-between align-items-center">
                            {user.fio}
                            <Link to={`/user/${user.id}`}>
                                <Button variant="outline-primary">Посмотреть</Button>
                            </Link>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </Container>
    );
};

export default UserList;
