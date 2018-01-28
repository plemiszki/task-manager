module ApplicationHelper

  def convert(hash)
    months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    if hash.has_key?(:every)
      if hash[:every] == :day
        "Daily"
      elsif hash[:every] == :week
        "#{hash[:on].to_s.capitalize}s"
      elsif hash[:every] == :month
        "Monthly"
      elsif hash[:every] == :year
        p hash
        "Every #{months[hash[:month][0] - 1]}"
      else
        "Custom"
      end
    else
      "Custom"
    end
  end

end
