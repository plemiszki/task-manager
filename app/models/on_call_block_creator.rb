class OnCallBlockCreator

  def self.create_blocks
    pager_duty_client = PagerDutyClient.new
    pager_duty_blocks = pager_duty_client.fetch_blocks
    google_client = GoogleClient.new
    google_client.create_events(pager_duty_blocks)
  end

end
