import { useState, useEffect } from 'react';
import './ItemList.css';

const API_URI = `http://${import.meta.env.VITE_API_URI}/doors`;

const ItemList = () => {
    const [items, setItems] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleteStatus, setDeleteStatus] = useState(null);
    const [newItemName, setNewItemName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Fetch items when component mounts
    useEffect(() => {
        fetchItems();
    }, []);

    // Function to fetch items
    const fetchItems = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(API_URI);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setItems(data);
        } catch (err) {
            setError(`Failed to fetch items: ${err.message}`);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    // Function to handle item creation
    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItemName.trim()) return;

        try {
            setIsAdding(true);
            setError(null);
            const response = await fetch(API_URI, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newItemName.trim() }),
            });

            if (!response.ok) {
                throw new Error(`Failed to add item: ${response.status}`);
            }

            const newItem = await response.json();
            setItems(prevItems => [...prevItems, newItem]);
            setNewItemName('');
            setIsAdding(false);
        } catch (err) {
            setError(`Failed to add item: ${err.message}`);
            setIsAdding(false);
        }
    };

    // Function to handle item deletion
    const handleDelete = async (id) => {
        try {
            setDeleteStatus('deleting');
            const response = await fetch(`${API_URI}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`Failed to delete item: ${response.status}`);
            }

            // Update the items state by filtering out the deleted item
            setItems(prevItems => prevItems.filter(item => item.id !== id));
            setDeleteStatus('success');
            
            // Clear success message after 2 seconds
            setTimeout(() => {
                setDeleteStatus(null);
            }, 2000);
        } catch (err) {
            setError(`Failed to delete item: ${err.message}`);
            setDeleteStatus('error');
        }
    };

    // Show loading state
    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>Loading items...</p>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="error">
                <p>{error}</p>
                <button onClick={fetchItems} className="retry-button">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="item-list">
            <h2>List of Items</h2>
            
            {/* Add Item Form */}
            <form onSubmit={handleAddItem} className="add-item-form">
                <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Enter item name"
                    className="item-input"
                    disabled={isAdding}
                />
                <button 
                    type="submit" 
                    className="add-button"
                    disabled={isAdding || !newItemName.trim()}
                >
                    {isAdding ? 'Adding...' : 'Add Item'}
                </button>
            </form>

            {deleteStatus === 'success' && (
                <div className="success-message">
                    Item deleted successfully!
                </div>
            )}
            {deleteStatus === 'error' && (
                <div className="error-message">
                    Failed to delete item. Please try again.
                </div>
            )}
            {items.length === 0 ? (
                <p className="no-items">No items found</p>
            ) : (
                <ul>
                    {items.map((item) => (
                        <li key={item.id} className="item">
                            <div className="item-content">
                                <span className="item-name">{item.name}</span>
                                <button 
                                    onClick={() => handleDelete(item.id)}
                                    className="delete-button"
                                    disabled={deleteStatus === 'deleting'}
                                >
                                    {deleteStatus === 'deleting' ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ItemList;
