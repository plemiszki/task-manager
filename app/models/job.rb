class Job < ActiveRecord::Base

  enum :status, { running: 0, success: 1, failed: 2, killed: 3 }

  def render_json
    self.as_json.deep_transform_keys { |k| k.to_s.camelize(:lower) }
  end

  def not_done?
    status == :running
  end

  def done?
    status != :running
  end

end
