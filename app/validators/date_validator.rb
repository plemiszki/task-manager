class DateValidator < ActiveModel::EachValidator

    def validate_each(record, attribute, value)
  
      value = record.attributes_before_type_cast[attribute.to_s]
  
      if !value.present? && !options[:blank_ok]
        record.errors.add attribute, "can't be blank"
        return
      end

      date = value.is_a?(Date) ? value : nil
  
      if value.present? && value.is_a?(String)  
        begin
          date = Date.parse(value)
        rescue Date::Error
          record.errors.add attribute, "is not a valid date"
          return
        end
      end

      if date.present? && !(1990..2040).include?(date.year)
        record.errors.add attribute, "is out of range"
      end
  
    end
  
  end