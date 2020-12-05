class AddRecipeTimeColumn < ActiveRecord::Migration[6.0]
  def change
    add_column :recipes, :time, :string, default: ""
  end
end
