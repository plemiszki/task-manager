class AddLongWeekendSetting < ActiveRecord::Migration[5.2]
  def change
    add_column :users, :long_weekend, :boolean
  end
end
