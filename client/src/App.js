
import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import { register, login, getTasks, addTask, updateTask, deleteTask } from './api';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('');
  const [error, setError] = useState('');
  const [debouncedFilter, setDebouncedFilter] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilter(filter);
    }, 300); // 300ms delay
    return () => clearTimeout(timer);
  }, [filter]);

  useEffect(() => {
    if (token) {
      // fetch tasks from server with current filter/sort
      const fetchTasks = async () => {
        const data = await getTasks(token, debouncedFilter, sort);
        setTasks(data);
      };
      fetchTasks();
    }
  }, [token, debouncedFilter, sort]);

  const handleRegister = async () => {
    setError('');
    try {
      const res = await register(username, password);
      if (res.success) {
        handleLogin();
      } else {
        setError(res.error || 'Registration failed. Please check your connection and try again.');
      }
    } catch (error) {
      setError('Cannot connect to server. Please check your internet connection.');
    }
  };

  const handleLogin = async () => {
    setError('');
    try {
      const res = await login(username, password);
      if (res.token) {
        setToken(res.token);
        setUsername('');
        setPassword('');
      } else {
        setError(res.error || 'Login failed. Please check your credentials and try again.');
      }
    } catch (error) {
      setError('Cannot connect to server. Please check your internet connection.');
    }
  };

  const handleLogout = () => {
    setToken('');
    setTasks([]);
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    await addTask(token, newTask);
    // refresh from server with current filter/sort
    const refreshed = await getTasks(token, debouncedFilter, sort);
    setTasks(refreshed);
    setNewTask('');
  };

  const handleEditTask = async (id) => {
    setEditId(id);
    const task = tasks.find(t => t._id === id);
    setEditText(task.text);
  };

  const handleUpdateTask = async () => {
    await updateTask(token, editId, editText);
    const refreshed = await getTasks(token, debouncedFilter, sort);
    setTasks(refreshed);
    setEditId(null);
    setEditText('');
  };

  const handleDeleteTask = async (id) => {
    await deleteTask(token, id);
    const refreshed = await getTasks(token, debouncedFilter, sort);
    setTasks(refreshed);
  };

  const filteredTasks = tasks;

  return (
    <div className="app">
      <div className="topbar">
        <div className="header">Task Manager</div>
        <div>
          {token ? <button className="logout-btn" onClick={handleLogout}>Logout</button> : null}
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
      {!token ? (
        <div className="auth-container">
          <h3>Welcome Back! 🚀</h3>
          <input 
            className="auth-input" 
            placeholder="Enter your username" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
          />
          <input 
            className="auth-input" 
            placeholder="Enter your password" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
          <div className="auth-buttons">
            <button className="btn-register" onClick={handleRegister}>Create Account</button>
            <button className="btn-login" onClick={handleLogin}>Sign In</button>
          </div>
        </div>
      ) : (
        <div className="card-grid">
          <div>
            <div className="card">
              <h3>✅ My Tasks</h3>
              <input 
                className="task-input" 
                placeholder="What needs to be done? ✨" 
                value={newTask} 
                onChange={e => setNewTask(e.target.value)} 
                onKeyPress={e => e.key === 'Enter' && handleAddTask()}
              />
              <button className="primary full-width" onClick={handleAddTask}>
                ➕ Add New Task
              </button>
              <div className="filter-controls">
                <div className="filter-group">
                  <label>🔍 Filter Tasks</label>
                  <input 
                    className="task-input" 
                    placeholder="Search tasks..." 
                    value={filter} 
                    onChange={e => setFilter(e.target.value)} 
                  />
                </div>
                <div className="filter-group">
                  <label>📊 Sort Order</label>
                  <select className="task-input" value={sort} onChange={e => setSort(e.target.value)}>
                    <option value="">Default Order</option>
                    <option value="asc">A → Z (Ascending)</option>
                    <option value="desc">Z → A (Descending)</option>
                  </select>
                </div>
              </div>
              {filteredTasks.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>No tasks yet!</h3>
                  <p>Add your first task above to get started</p>
                </div>
              ) : (
                <ul className="task-list">
                  {filteredTasks.map((task, index) => (
                    <li className="task-item" key={task._id} style={{animationDelay: `${index * 0.1}s`}}>
                      {editId === task._id ? (
                        <>
                          <div className="task-text">
                            <input 
                              className="task-input" 
                              value={editText} 
                              onChange={e => setEditText(e.target.value)}
                              onKeyPress={e => e.key === 'Enter' && handleUpdateTask()}
                              autoFocus
                            />
                          </div>
                          <div className="task-actions">
                            <button onClick={handleUpdateTask}>💾 Save</button>
                            <button onClick={() => setEditId(null)}>❌ Cancel</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="task-text">
                            <span className="task-number">#{index + 1}</span>
                            {task.text}
                          </div>
                          <div className="task-actions">
                            <button onClick={() => handleEditTask(task._id)}>✏️ Edit</button>
                            <button onClick={() => handleDeleteTask(task._id)}>🗑️ Delete</button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div>
            <div className="card">
              <h3>📊 Task Analytics</h3>
              <div className="details-panel">
                <p><strong>Showing Tasks:</strong> {filteredTasks.length}</p>
                <p><strong>Completion Rate:</strong> 100%</p>
              </div>
              <div className="details-panel">
                <p>💡 <em>Tip: Use the filter to quickly find your tasks!</em></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
