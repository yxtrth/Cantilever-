
import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (token) {
      // fetch tasks from server with current filter/sort
      const fetchTasks = async () => {
        const url = new URL(process.env.REACT_APP_API_URL + '/tasks');
        if (filter) url.searchParams.append('q', filter);
        if (sort) url.searchParams.append('sort', sort);
        const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setTasks(data);
      };
      fetchTasks();
    }
  }, [token, filter, sort]);

  const handleRegister = async () => {
    setError('');
    const res = await register(username, password);
    if (res.success) {
      handleLogin();
    } else {
      setError('Registration failed');
    }
  };

  const handleLogin = async () => {
    setError('');
    const res = await login(username, password);
    if (res.token) {
      setToken(res.token);
      setUsername('');
      setPassword('');
    } else {
      setError('Login failed');
    }
  };

  const handleLogout = () => {
    setToken('');
    setTasks([]);
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
  const res = await addTask(token, newTask);
  // refresh from server
  const refreshed = await getTasks(token);
  setTasks(refreshed);
    setNewTask('');
  };

  const handleEditTask = async (id) => {
    setEditId(id);
    const task = tasks.find(t => t._id === id);
    setEditText(task.text);
  };

  const handleUpdateTask = async () => {
  const res = await updateTask(token, editId, editText);
  const refreshed = await getTasks(token);
  setTasks(refreshed);
    setEditId(null);
    setEditText('');
  };

  const handleDeleteTask = async (id) => {
  await deleteTask(token, id);
  const refreshed = await getTasks(token);
  setTasks(refreshed);
  };

  let filteredTasks = tasks.filter(t => t.text.toLowerCase().includes(filter.toLowerCase()));
  if (sort === 'asc') filteredTasks = filteredTasks.sort((a, b) => a.text.localeCompare(b.text));
  if (sort === 'desc') filteredTasks = filteredTasks.sort((a, b) => b.text.localeCompare(a.text));

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
                <p><strong>Total Tasks:</strong> {tasks.length}</p>
                <p><strong>Filtered Tasks:</strong> {filteredTasks.length}</p>
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
