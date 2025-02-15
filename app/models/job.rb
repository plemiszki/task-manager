class Job < ActiveRecord::Base

  enum status: [:running, :success, :failed, :killed]

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
