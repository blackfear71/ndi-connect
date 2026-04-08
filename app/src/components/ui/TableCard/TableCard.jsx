import './TableCard.css';

/**
 * Carte tableau
 */
const TableCard = ({ icon, title, table }) => {
    return (
        <div className="table-card mt-3">
            {/* Entête de la carte */}
            <div className="d-flex align-items-center gap-2 p-2 table-card-header">
                {icon}
                {title}
            </div>

            {/* Tableau de la carte */}
            <div className="d-flex flex-column ps-2 pe-2">
                {table?.map(({ label, value }) => (
                    <div key={label} className="table-card-line">
                        <span className="table-card-line-label">{label}</span>
                        <span className="table-card-line-value">{value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TableCard;
