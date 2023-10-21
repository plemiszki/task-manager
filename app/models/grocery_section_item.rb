class GrocerySectionItem < ActiveRecord::Base

  validates :grocery_section_id, :position, presence: true

end
