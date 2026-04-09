import React from 'react';

const events = [
  {
    id: 1,
    title: 'VIP Gala Night',
    date: '2026-04-15',
    time: '18:00',
    location: 'Grand Ballroom',
    attendees: 150,
    status: 'upcoming',
  },
  {
    id: 2,
    title: 'Exclusive Wine Tasting',
    date: '2026-04-10',
    time: '17:00',
    location: 'Wine Cellar',
    attendees: 30,
    status: 'ongoing',
  },
  {
    id: 3,
    title: 'Charity Auction',
    date: '2026-04-01',
    time: '19:00',
    location: 'Auction House',
    attendees: 200,
    status: 'completed',
  },
];

const EventManagement = () => {
  const [filter, setFilter] = React.useState('all');

  const filteredEvents = events.filter(event =>
    filter === 'all' || event.status === filter
  );

  return (
    <div>
      <h1>Exclusive VIP Events</h1>
      <div>
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('upcoming')}>Upcoming</button>
        <button onClick={() => setFilter('ongoing')}>Ongoing</button>
        <button onClick={() => setFilter('completed')}>Completed</button>
      </div>
      <ul>
        {filteredEvents.map(event => (
          <li key={event.id}>
            <h2>{event.title}</h2>
            <p>Date: {event.date}</p>
            <p>Time: {event.time}</p>
            <p>Location: {event.location}</p>
            <p>Attendees: {event.attendees}</p>
            <button>Register</button>
            <button>Check In</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventManagement;