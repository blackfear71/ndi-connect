/**
 * Composant de saisie (création)
 * @param {*} param0
 * @returns
 */
const TestForm = ({ formData, setFormData, onSubmit }) => {
    /**
     * Met à jour le formik à la saisie (création)
     * @param {*} e Evènement
     */
    const handleChange = (e) => {
        // Autorise uniquement les chiffres
        const { name, value } = e.target;

        if (/^\d*$/.test(value)) {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    return (
        <div>
            <input
                type="text"
                name="year"
                placeholder="Année"
                value={formData.year}
                onChange={handleChange}
                maxLength={4}
                inputMode="numeric"
                pattern="[0-9]*"
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
