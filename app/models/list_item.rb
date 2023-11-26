class ListItem < ActiveRecord::Base

  validates :list_id, :text, :position, presence: true

  belongs_to :list

end
