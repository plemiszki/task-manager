module ApplicationHelper

  def convert(hash)
    months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    if hash.has_key?(:every)
      if hash[:every] == :day
        if hash.has_key?(:interval)
          "Every #{hash[:interval]} days"
        else
          "Daily"
        end
      elsif hash[:every] == :week
        "#{hash[:on].to_s.capitalize}s"
      elsif hash[:every] == :month
        "Monthly"
      elsif hash[:every] == :year
        if hash[:mday][0] != 1
          "Every #{months[hash[:month][0] - 1]} #{hash[:mday][0]}"
        else
          "Every #{months[hash[:month][0] - 1]}"
        end
      else
        "Custom"
      end
    else
      "Custom"
    end
  end

end
