class PagerDutyClient

  def fetch_blocks
    start_date = Date.today - 1.month
    end_date = Date.today + 6.months
    url = "https://api.pagerduty.com/schedules/PNC437E?since=#{start_date.to_time.iso8601}&until=#{end_date.to_time.iso8601}"
    response = HTTParty.get(url, headers: { 'Authorization' => "Token token=#{ENV.fetch('PAGERDUTY_API_KEY')}" })
    entries = response['schedule']['final_schedule']['rendered_schedule_entries']
    my_entries = entries.filter { |entry| entry['user']['summary'] == 'Peter Lemiszki' }
    my_entries.map! { |entry| { start: entry['start'], end: entry['end'] } }
  end

end
