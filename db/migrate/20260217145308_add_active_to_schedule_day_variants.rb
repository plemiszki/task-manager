class AddActiveToScheduleDayVariants < ActiveRecord::Migration[8.1]
  def change
    add_column :schedule_day_variants, :active, :boolean, default: false, null: false
  end
end
