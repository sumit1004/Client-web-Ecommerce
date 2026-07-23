import { business } from '../../constants/store.js';

export function AnnouncementBar() {
  return (
    <div className="announcement" role="banner">
      <div className="announcement-track">
        <span>{business.announcement}</span>
        <span>{business.announcement}</span>
      </div>
    </div>
  );
}
