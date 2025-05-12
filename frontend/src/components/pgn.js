import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const PgnUploader = ({ roundId, onSuccess }) => {
    const salt = process.env.REACT_APP_SALT;
    const [uploading, setUploading] = useState(false);
    const [alert, setAlert] = useState(null);

    const onDrop = useCallback(async (acceptedFiles) => {
        if (!acceptedFiles.length) return;
        const file = acceptedFiles[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('round_id', roundId);
        formData.append('salt', salt);

        setUploading(true);
        setAlert(null);

        try {
            await axios.post('http://localhost:5000/api/pgn_upload', formData);
            setAlert({ type: 'success', message: 'Файл успешно загружен и обработан' });
            onSuccess();
        } catch (error) {
            const message = error.response?.data?.error || 'Ошибка загрузки файла';
            setAlert({ type: 'danger', message });
        } finally {
            setUploading(false);
        }
    }, [roundId, onSuccess, salt]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'text/plain': ['.pgn'] },
        multiple: false,
    });

    return (
        <div className="mt-3">
            {alert && <Alert variant={alert.type}>{alert.message}</Alert>}
            <div
                {...getRootProps()}
                className={`p-4 border rounded text-center ${isDragActive ? 'bg-light' : ''}`}
                style={{ cursor: 'pointer' }}
            >
                <input {...getInputProps()} />
                {isDragActive
                    ? 'Отпустите файл для загрузки...'
                    : 'Перетащите сюда PGN-файл или нажмите для выбора'}
            </div>
            {uploading && <Spinner animation="border" size="sm" className="mt-2" />}
        </div>
    );
};

export default PgnUploader;