module ApplicationHelper

  def convert(hash)
    hash.to_s == "{:every=>:day}" ? "Daily" : "Custom"
  end

end
