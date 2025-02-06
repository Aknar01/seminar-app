import React, { useState, useEffect } from 'react';
import './App.css';

// URL для доступа к JSON-серверу
const API_URL = 'http://localhost:5001/seminars';

function App() {
  const [seminars, setSeminars] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSeminar, setSelectedSeminar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загружаем данные о семинарах при монтировании компонента
  useEffect(() => {
    fetchSeminars();
  }, []);

  // Функция для загрузки семинаров с сервера
  const fetchSeminars = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Не удалось загрузить данные');
      }
      const data = await response.json();
      setSeminars(data);
      setIsLoading(false);
    } catch (error) {
      setError(error.message);  // Устанавливаем ошибку в состояние
      setIsLoading(false);
    }
  };

  // Функция для удаления семинара
  const deleteSeminar = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить семинар?')) {
      try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        setSeminars(seminars.filter((seminar) => seminar.id !== id)); // Обновляем список после удаления
      } catch (error) {
        alert('Ошибка при удалении семинара');
      }
    }
  };

  // Открытие модального окна для редактирования семинара
  const openEditModal = (seminar) => {
    setSelectedSeminar(seminar);
    setIsModalOpen(true);
  };

  // Закрытие модального окна
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSeminar(null);
  };

  // Обработка изменений при редактировании семинара
  const handleEditSubmit = async (event) => {
    event.preventDefault();
    try {
      await fetch(`${API_URL}/${selectedSeminar.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedSeminar),
      });
      fetchSeminars(); // Перезагружаем данные после редактирования
      closeModal();
    } catch (error) {
      alert('Ошибка при сохранении семинара');
    }
  };

  // Если данные загружаются, показываем индикатор загрузки
  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  // Если ошибка при загрузке, отображаем ошибку
  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  return (
    <div className="container">
      <h1>Семинары</h1>
      <div className="grid">
        {seminars.map((seminar) => (
          <div key={seminar.id} className="card">
            <img src={seminar.photo} alt={seminar.title} />
            <div className="content">
              <h2>{seminar.title}</h2>
              <p>{seminar.description}</p>
              <p className="date">{seminar.date} в {seminar.time}</p>
              <div className="actions">
                <button className="edit" onClick={() => openEditModal(seminar)}>Редактировать</button>
                <button className="delete" onClick={() => deleteSeminar(seminar.id)}>Удалить</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно для редактирования семинара */}
      {isModalOpen && selectedSeminar && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form onSubmit={handleEditSubmit}>
              <input
                type="text"
                value={selectedSeminar.title}
                onChange={(e) => setSelectedSeminar({ ...selectedSeminar, title: e.target.value })}
              />
              <textarea
                value={selectedSeminar.description}
                onChange={(e) => setSelectedSeminar({ ...selectedSeminar, description: e.target.value })}
              />
              <div className="actions">
                <button className="save" type="submit">Сохранить</button>
                <button className="cancel" type="button" onClick={closeModal}>Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
