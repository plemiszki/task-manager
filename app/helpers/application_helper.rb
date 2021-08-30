module ApplicationHelper

  def convert(recurring_task)
    hash = recurring_task.montrose_object.to_hash
    if hash.has_key?(:every)
      if hash[:every] == :day
        if hash.has_key?(:interval)
          "Every #{hash[:interval]} days - next on #{recurring_task.next_occurrence.strftime('%m/%d')}"
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
          elsif days.join(' ') == "monday tuesday wednesday thursday friday"
            "Weekdays"
          else
            days.length <= 3 ? days.map { |day| "#{day.capitalize}s" }.join(", ") : days.map { |day| "#{day.capitalize[0...3]}" }.join(", ")
          end
        end
      elsif hash[:every] == :month
        "Monthly"
      elsif hash[:every] == :year
        if hash[:mday][0] != 1
          "Every #{Date::MONTHNAMES[hash[:month][0]]} #{hash[:mday][0].ordinalize}"
        else
          "Every #{Date::MONTHNAMES[hash[:month][0]]}"
        end
      else
        "Custom"
      end
    else
      "Custom"
    end
  end

end
