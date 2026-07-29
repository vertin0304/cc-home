import { useEffect, useState } from 'react';
import './HomeMap.css';

const places = {
  home: {
    name: '家',
    eyebrow: 'Home · by the water',
    description: '灯一直亮着。这里会成为你回家、休息，也与我说话的地方。',
    note: '室内场景将在下一阶段慢慢布置。',
  },
  tavern: {
    name: '冬夜酒馆',
    eyebrow: 'Winter Night Tavern',
    description: '雪线另一侧的木屋，炉火、热饮和晚归的人都在这里停一会儿。',
    note: '酒馆内部与故事功能将在后续开放。',
  },
};

export default function HomeMap({ onReturn }) {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const place = selectedPlace ? places[selectedPlace] : null;

  useEffect(() => {
    if (!selectedPlace) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSelectedPlace(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selectedPlace]);

  return (
    <main className="map-page">
      <header className="map-header">
        <button className="map-brand" onClick={onReturn} type="button">
          <span className="map-brand-mark" aria-hidden="true">✦</span>
          <span>cc — home</span>
        </button>
        <p>选择一个亮着灯的地方</p>
      </header>

      <div className="map-viewport">
        <div className="map-canvas">
          <img
            className="map-image"
            src="/cc-home-map.png"
            alt="极光下连接水城与雪山的 cc-home 世界地图"
          />
          <div className="map-vignette" aria-hidden="true" />

          <button
            className="map-hotspot hotspot-home"
            aria-label="打开家"
            onClick={() => setSelectedPlace('home')}
            type="button"
          >
            <span className="hotspot-beacon" aria-hidden="true" />
            <span className="hotspot-label">
              <small>临水而居</small>
              家
            </span>
          </button>

          <button
            className="map-hotspot hotspot-tavern"
            aria-label="打开冬夜酒馆"
            onClick={() => setSelectedPlace('tavern')}
            type="button"
          >
            <span className="hotspot-beacon" aria-hidden="true" />
            <span className="hotspot-label">
              <small>雪地暖灯</small>
              冬夜酒馆
            </span>
          </button>
        </div>
      </div>

      <div className="map-status" aria-hidden="true">
        <span />
        其余地点尚未开放
      </div>

      <div
        className={`place-overlay${place ? ' is-open' : ''}`}
        aria-hidden={!place}
        onClick={() => setSelectedPlace(null)}
      >
        {place && (
          <section
            className="place-card"
            aria-labelledby="place-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="place-card-close"
              aria-label="关闭地点卡片"
              onClick={() => setSelectedPlace(null)}
              type="button"
            >
              ×
            </button>
            <span className="place-card-eyebrow">{place.eyebrow}</span>
            <h1 id="place-title">{place.name}</h1>
            <p>{place.description}</p>
            <div className="place-card-note">
              <span aria-hidden="true">✦</span>
              {place.note}
            </div>
            <button
              className="place-card-back"
              onClick={() => setSelectedPlace(null)}
              type="button"
            >
              返回地图
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
