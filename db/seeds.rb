# DatabaseCleaner.clean_with :truncation

user = User.find_by(email: 'plemiszki@gmail.com')

ScheduleBlock.destroy_all

if user
  ScheduleBlock.create!([
    { user: user, weekday: 0, start_time: '09:00', end_time: '10:00', color: '#5bc0de', text: 'Morning Review' },
    { user: user, weekday: 0, start_time: '10:30', end_time: '12:00', color: '#5cb85c', text: 'Deep Work' },
    { user: user, weekday: 0, start_time: '13:00', end_time: '14:00', color: '#f0ad4e', text: 'Meetings' },
    { user: user, weekday: 1, start_time: '09:00', end_time: '10:30', color: '#5cb85c', text: 'Deep Work' },
    { user: user, weekday: 1, start_time: '11:00', end_time: '12:00', color: '#5bc0de', text: 'Code Review' },
    { user: user, weekday: 1, start_time: '14:00', end_time: '15:30', color: '#f0ad4e', text: 'Meetings' },
    { user: user, weekday: 2, start_time: '08:00', end_time: '09:00', color: '#d9534f', text: 'Gym' },
    { user: user, weekday: 2, start_time: '10:00', end_time: '12:00', color: '#5cb85c', text: 'Deep Work' },
    { user: user, weekday: 2, start_time: '13:30', end_time: '14:30', color: '#f0ad4e', text: 'Standup' },
    { user: user, weekday: 3, start_time: '09:00', end_time: '10:00', color: '#5bc0de', text: 'Morning Review' },
    { user: user, weekday: 3, start_time: '10:30', end_time: '12:30', color: '#5cb85c', text: 'Deep Work' },
    { user: user, weekday: 3, start_time: '15:00', end_time: '16:00', color: '#f0ad4e', text: 'Meetings' },
    { user: user, weekday: 4, start_time: '09:00', end_time: '11:00', color: '#5cb85c', text: 'Deep Work' },
    { user: user, weekday: 4, start_time: '11:30', end_time: '12:30', color: '#5bc0de', text: 'Code Review' },
    { user: user, weekday: 4, start_time: '14:00', end_time: '15:00', color: '#f0ad4e', text: 'Retro' },
    { user: user, weekday: 5, start_time: '10:00', end_time: '12:00', color: '#337ab7', text: 'Side Project' },
    { user: user, weekday: 5, start_time: '14:00', end_time: '15:30', color: '#d9534f', text: 'Gym' },
    { user: user, weekday: 6, start_time: '09:00', end_time: '10:00', color: '#337ab7', text: 'Planning' },
    { user: user, weekday: 6, start_time: '17:00', end_time: '18:30', color: '#d9534f', text: 'Gym' },
  ])
end
