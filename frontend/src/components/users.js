import React, { useEffect, useState, useCallback } from "react";
import { ListGroup, Container, Spinner, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useHelmetTitle } from "../hooks/indexHooks";
import axios from "../instances/axiosInstance";

const UserList = () => {
    useHelmetTitle("Пользователи");

    const [state, setState] = useState({
        users: [],
        loading: true,
        error: null
    });

    const fetchUsers = useCallback(async () => {
        try {
            const response = await axios.get("/users");
            setState({
                users: response.data,
                loading: false,
                error: null
            });
        } catch (error) {
            setState({
                users: [],
                loading: false,
                error: "Ошибка загрузки пользователей. Попробуйте позже."
            });
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const { users, loading, error } = state;

    if (loading) {
        return <Spinner animation="border" />;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <Container className="mt-4">
            <ListGroup>
                <ListGroup.Item variant="primary">Список пользователей</ListGroup.Item>
                {users.map((user) => (
                    <ListGroup.Item
                        key={user.id}
                        variant="warning"
                        className="d-flex justify-content-between align-items-center"
                    >
                        {user.fio}
                        <Link to={`/users/${user.id}`}>
                            <Button variant="outline-primary">Посмотреть</Button>
                        </Link>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </Container>
    );
};

export default UserList;
