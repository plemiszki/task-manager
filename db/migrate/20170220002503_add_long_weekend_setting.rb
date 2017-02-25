class AddLongWeekendSetting < ActiveRecord::Migration
  def change
    add_column :users, :long_weekend, :boolean
  end
end
