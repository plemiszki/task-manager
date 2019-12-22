module ApplicationHelper

  MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  def convert(hash)
    if hash.has_key?(:every)
      if hash[:every] == :day
        if hash.has_key?(:interval)
          "Every #{hash[:interval]} days"
        else
          "Daily"
        end
      elsif hash[:every] == :week
        if hash.has_key?(:interval)
          "Every #{hash[:interval]} weeks on #{hash[:on].to_s.capitalize}s"
        else
          days = hash[:on]
          if days.class == String
            "#{hash[:on].to_s.capitalize}s"
          else
            days.length <= 3 ? days.map { |day| "#{day.capitalize}s" }.join(", ") : days.map { |day| "#{day.capitalize[0...3]}" }.join(", ")
          end
        end
      elsif hash[:every] == :month
        "Monthly"
      elsif hash[:every] == :year
        if hash[:mday][0] != 1
          "Every #{MONTHS[hash[:month][0] - 1]} #{hash[:mday][0].ordinalize}"
        else
          "Every #{MONTHS[hash[:month][0] - 1]}"
        end
      else
        "Custom"
      end
    else
      "Custom"
    end
  end

end
