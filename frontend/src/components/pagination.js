import React from 'react';
import { Pagination } from 'react-bootstrap';

const CustomPagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pageItems = [];

    const range = 2;
    const startPage = Math.max(1, currentPage - range);
    const endPage = Math.min(totalPages, currentPage + range);

    if (startPage > 1) {
        pageItems.push(
            <Pagination.Item key={1} onClick={() => onPageChange(1)}>{1}</Pagination.Item>
        );
        if (startPage > 2) {
            pageItems.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
        }
    }

    for (let page = startPage; page <= endPage; page++) {
        pageItems.push(
            <Pagination.Item
                key={page}
                active={page === currentPage}
                onClick={() => onPageChange(page)}
            >
                {page}
            </Pagination.Item>
        );
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pageItems.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
        }
        pageItems.push(
            <Pagination.Item key={totalPages} onClick={() => onPageChange(totalPages)}>
                {totalPages}
            </Pagination.Item>
        );
    }

    return (
        <Pagination className="justify-content-center mt-3">
            <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            />
            {pageItems}
            <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            />
        </Pagination>
    );
};

export default CustomPagination;