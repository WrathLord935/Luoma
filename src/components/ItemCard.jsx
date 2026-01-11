import { MapPin, RefreshCw } from 'lucide-react';
import Card from './Card';
import './ItemCard.css';

export default function ItemCard({ item }) {
    return (
        <Card className="item-card">
            <div className="item-image-container">
                <img src={item.image} alt={item.title} className="item-image" />
                <span className={`item-badge item-badge--${item.type.toLowerCase()}`}>
                    {item.type}
                </span>
            </div>

            <div className="item-details">
                <h3 className="item-title">{item.title}</h3>

                <div className="item-meta">
                    <span className="item-size">{item.size}</span>
                    <span className="item-condition">{item.condition}</span>
                </div>

                <div className="item-location">
                    <MapPin size={14} />
                    <span>{item.distance} away</span>
                </div>

                <div className="item-footer">
                    <div className="item-owner">
                        <div className="owner-avatar">{item.owner[0]}</div>
                        <span>{item.owner}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
