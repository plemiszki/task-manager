class GoogleClient

  EVENT_SUMMARY = 'ON CALL'
  EVENT_COLOR = '11'

  def initialize
    @client = Signet::OAuth2::Client.new(client_options)
  end

  def authorization_uri
    @client.authorization_uri.to_s
  end

  def print_refresh_token(code)
    @client.code = code
    response = @client.fetch_access_token!
    p '--------------'
    p "REFRESH TOKEN: #{response["refresh_token"]}"
    p '--------------'
  end

  def create_events(pager_duty_blocks)
    refresh_token = ENV.fetch('GOOGLE_REFRESH_TOKEN')
    @client.update!({ refresh_token: refresh_token })
    response = @client.refresh!
    @client.update!(response)
    service = Google::Apis::CalendarV3::CalendarService.new
    service.authorization = @client
    calendar = service.list_calendar_lists.items.find { |calendar| calendar.summary == 'plemiszki@gmail.com' }
    existing_on_call_events = service.list_events(calendar.id, { time_min: (DateTime.now - 3.months), max_results: 1000 }).items.select { |event| event.summary == EVENT_SUMMARY }
    existing_on_call_events.each do |event|
      service.delete_event(calendar.id, event.id)
    end
    pager_duty_blocks.each do |block|
      event = Google::Apis::CalendarV3::Event.new({
        start: Google::Apis::CalendarV3::EventDateTime.new(date_time: DateTime.parse(block[:start])),
        end: Google::Apis::CalendarV3::EventDateTime.new(date_time: DateTime.parse(block[:end])),
        summary: 'ON CALL',
        color_id: EVENT_COLOR
      })
      service.insert_event(calendar.id, event)
    end
  end

  private

  def client_options
    {
      client_id: ENV.fetch('GOOGLE_CLIENT_ID'),
      client_secret: ENV.fetch('GOOGLE_CLIENT_SECRET'),
      authorization_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_credential_uri: 'https://accounts.google.com/o/oauth2/token',
      scope: Google::Apis::CalendarV3::AUTH_CALENDAR,
      redirect_uri: Rails.env == 'production' ? 'https://task-mngr.herokuapp.com/on_call_callback' : 'http://localhost:3000/on_call_callback'
    }
  end

end
