import { Button, Form, InputGroup } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

import './searchBar.css';

const SearchBar = ({ placeholder = 'Rechercher...' }) => {
    return (
        <div className="search-bar-container">
            <InputGroup className="search-bar-group">
                <Button
                    variant="outline-secondary"
                    className="search-bar-button"
                >
                    <FaSearch size={20} />
                </Button>
                <Form.Control
                    placeholder={placeholder}
                    className="search-bar-text"
                />
            </InputGroup>
        </div>
    );
};

export default SearchBar;
