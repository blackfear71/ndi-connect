const TestForm = ({ formData, setFormData, onSubmit }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div>
            <input
                type="text"
                name="year"
                placeholder="Année"
                value={formData.year}
                onChange={handleChange}
            />
            <input
                type="text"
                name="place"
                placeholder="Lieu"
                value={formData.place}
                onChange={handleChange}
            />
            <button onClick={() => onSubmit(formData)}>Ajouter</button>
        </div>
    );
};

export default TestForm;
