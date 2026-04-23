import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../api/tasks';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', status: 'pending' });

  // Fetch tasks on load
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await getAllTasks();
      setTasks(res.data.tasks);
    } catch (err) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await updateTask(editingTask.id, form);
        toast.success('Task updated!');
      } else {
        await createTask(form);
        toast.success('Task created!');
      }
      setForm({ title: '', description: '', status: 'pending' });
      setEditingTask(null);
      setShowForm(false);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setForm({ title: task.title, description: task.description || '', status: task.status });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      toast.success('Task deleted!');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTask(null);
    setForm({ title: '', description: '', status: 'pending' });
  };

  const statusColor = (status) => {
    if (status === 'completed') return '#27ae60';
    if (status === 'in_progress') return '#f39c12';
    return '#95a5a6';
  };

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Tasks</h1>
            <p style={styles.subtitle}>
              {user?.role === 'admin' ? 'Admin — viewing all tasks' : `${tasks.length} task(s)`}
            </p>
          </div>
          <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Task'}
          </button>
        </div>

        {/* Task Form */}
        {showForm && (
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={styles.field}>
                <label style={styles.label}>Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Task title"
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Optional description"
                  style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div style={styles.formActions}>
                <button type="submit" style={styles.submitBtn}>
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
                <button type="button" onClick={handleCancel} style={styles.cancelBtn}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Task List */}
        {loading ? (
          <p style={styles.empty}>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p style={styles.empty}>No tasks yet. Create your first one!</p>
        ) : (
          <div style={styles.taskList}>
            {tasks.map((task) => (
              <div key={task.id} style={styles.taskCard}>
                <div style={styles.taskTop}>
                  <h3 style={styles.taskTitle}>{task.title}</h3>
                  <span
                    style={{
                      ...styles.statusBadge,
                      background: statusColor(task.status),
                    }}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
                {task.description && (
                  <p style={styles.taskDesc}>{task.description}</p>
                )}
                {user?.role === 'admin' && task.user && (
                  <p style={styles.taskOwner}>👤 {task.user.name}</p>
                )}
                <div style={styles.taskActions}>
                  <button onClick={() => handleEdit(task)} style={styles.editBtn}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(task.id)} style={styles.deleteBtn}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '32px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
  title: { fontSize: '26px', fontWeight: '600', color: '#1a1a2e' },
  subtitle: { fontSize: '14px', color: '#888', marginTop: '4px' },
  addBtn: { padding: '10px 20px', background: '#4f8ef7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  formCard: { background: '#fff', padding: '28px', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '28px' },
  formTitle: { fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#1a1a2e' },
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#444' },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none' },
  formActions: { display: 'flex', gap: '12px', marginTop: '8px' },
  submitBtn: { padding: '10px 24px', background: '#4f8ef7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  cancelBtn: { padding: '10px 24px', background: '#f0f2f5', color: '#666', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  taskList: { display: 'flex', flexDirection: 'column', gap: '14px' },
  taskCard: { background: '#fff', padding: '20px 24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  taskTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  taskTitle: { fontSize: '16px', fontWeight: '500', color: '#1a1a2e' },
  statusBadge: { fontSize: '12px', color: '#fff', padding: '3px 12px', borderRadius: '20px', textTransform: 'capitalize' },
  taskDesc: { fontSize: '14px', color: '#777', marginBottom: '8px', lineHeight: '1.5' },
  taskOwner: { fontSize: '12px', color: '#aaa', marginBottom: '8px' },
  taskActions: { display: 'flex', gap: '10px', marginTop: '12px' },
  editBtn: { padding: '6px 18px', background: '#f0f2f5', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: '#444' },
  deleteBtn: { padding: '6px 18px', background: '#fff0f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: '#e74c3c' },
  empty: { textAlign: 'center', color: '#aaa', marginTop: '60px', fontSize: '16px' },
};

export default Dashboard;