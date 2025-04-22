export function isAuthenticated() {
    return localStorage.getItem("token") !== null;
}

export function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}

export function getUserInfo() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
}

export function isAdmin() {
    const user = getUserInfo();
    return user?.is_admin || false;
}