class AddRecipeName < ActiveRecord::Migration[5.2]
  def change
    add_column :recipes, :name, :string, null: false
  end
end
